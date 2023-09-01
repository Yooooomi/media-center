import * as endpoints from '@media-center/server/src/endpoints/v1';
import {
  Query,
  ReturnTypeOfQuery,
} from '@media-center/server/src/framework/query';
import {ApiSerializer} from '@media-center/server/src/endpoints/apiSerializer/apiSerializer';
import Axios from 'axios';
import {
  Command,
  ReturnTypeOfCommand,
} from '@media-center/server/src/framework/command';
import {Platform} from 'react-native';

type ReturnTypeOfQueryOrCommand<C> = C extends Query<any>
  ? ReturnTypeOfQuery<C>
  : C extends Command<any>
  ? ReturnTypeOfCommand<C>
  : never;

type AllEndpoints = {
  [k in keyof typeof endpoints]: (
    ...args: Parameters<(typeof endpoints)[k]['handler']>
  ) => Promise<
    ReturnTypeOfQueryOrCommand<ReturnType<(typeof endpoints)[k]['handler']>>
  >;
};

const axios = Axios.create({
  baseURL: Platform.select({
    ios: 'http://localhost:8080',
    android: 'http://10.0.2.2:8080',
  }),
});

const bridgeSerializer = new ApiSerializer();

export const api = Object.entries(endpoints).reduce<Record<string, any>>(
  (acc, [name, value]) => {
    if (value.method === 'get') {
      acc[name] = async (args: any[]) => {
        const {data, status} = await axios.get(`/${name}`, {
          params: args,
        });
        if (status === 204) {
          return undefined;
        }
        return bridgeSerializer.deserialize(data);
      };
    } else if (value.method === 'post') {
      acc[name] = async (args: any[]) => {
        const {data, status} = await axios.post(`/${name}`, args);
        if (status === 204) {
          return undefined;
        }
        return bridgeSerializer.deserialize(data);
      };
    }
    return acc;
  },
  {},
) as AllEndpoints;
