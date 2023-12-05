import Axios from 'axios';
import {HierarchyItemId} from '@media-center/server/src/domains/fileWatcher/domain/hierarchyItemId';
import {
  InternalQuery,
  QueryReturnType,
} from '@media-center/server/src/framework/query';
import {
  CommandReturnType,
  InternalCommand,
} from '@media-center/server/src/framework/command';
import {SERVER_ENDPOINT} from './constants';

const axios = Axios.create({
  baseURL: SERVER_ENDPOINT,
});
export class Beta {
  static async query<Q extends InternalQuery<any, any>>(
    query: Q,
  ): Promise<QueryReturnType<Q>> {
    const serialized = (query.needing as any)?.serialize(query.data);
    const {data} = await axios.post(`/query/${query.constructor.name}`, {
      needing: serialized,
    });
    return query.returning?.deserialize(data);
  }

  static async command<Q extends InternalCommand<any, any>>(
    command: Q,
  ): Promise<CommandReturnType<Q>> {
    const serialized = (command.needing as any).serialize(command.data);
    const {data} = await axios.post(`/command/${command.constructor.name}`, {
      needing: serialized,
    });
    return command.returning?.deserialize(data);
  }
}

export function useVideoUri(hierarchyItemId: HierarchyItemId) {
  return `${SERVER_ENDPOINT}/video/${hierarchyItemId.toString()}`;
}
