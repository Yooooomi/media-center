import Axios from 'axios';
import {Platform} from 'react-native';
import {HierarchyItemId} from '@media-center/server/src/domains/fileWatcher/domain/hierarchyItemId';
import {
  InternalQuery,
  QueryReturnType,
} from '@media-center/server/src/framework/query';
import {
  CommandReturnType,
  InternalCommand,
} from '@media-center/server/src/framework/command';

const BASE_URL = Platform.select({
  ios: 'http://localhost:8080',
  android: 'http://10.0.2.2:8080',
});
const axios = Axios.create({
  baseURL: BASE_URL,
});

export class Beta {
  static async query<Q extends InternalQuery<any, any, any>>(
    query: Q,
  ): Promise<QueryReturnType<Q>> {
    console.log('Serializing');
    const serialized = (query.needing as any)?.serialize(query.data);
    console.log('Serialized');
    const {data} = await axios.post(`/query/${query.constructor.name}`, {
      needing: serialized,
    });
    console.log('Received', JSON.stringify(data, null, ' '));
    if (query.returningMaybeOne) {
      console.log('Should return one');
      return data ? query.returningMaybeOne?.deserialize(data) : undefined;
    } else if (query.returningMany) {
      console.log('Should return many');
      return data.map((d: any) => query.returningMany?.deserialize(d));
    }
    throw new Error('Query did not return anything');
  }

  static async command<Q extends InternalCommand<any, any, any>>(
    command: Q,
  ): Promise<CommandReturnType<Q>> {
    console.log('Serializing');
    const serialized = (command.needing as any).serialize(command.data);
    console.log('Serialized');
    const {data} = await axios.post(`/command/${command.constructor.name}`, {
      needing: serialized,
    });
    console.log('Received', JSON.stringify(data, null, ' '));
    if (command.returningMaybeOne) {
      console.log('Should return one');
      return data ? command.returningMaybeOne?.deserialize(data) : undefined;
    } else if (command.returningMany) {
      console.log('Should return many');
      return data.map((d: any) => command.returningMany?.deserialize(d));
    }
    return undefined as any;
  }
}

export function useVideoUri(hierarchyItemId: HierarchyItemId) {
  return `${BASE_URL}/video/${hierarchyItemId.toString()}`;
}
