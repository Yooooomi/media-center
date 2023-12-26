import Axios from 'axios';
import {HierarchyItemId} from '@media-center/server/src/domains/fileWatcher/domain/hierarchyItemId';
import {SERVER_ENDPOINT} from './constants';
import {
  BaseIntention,
  IntentionConstructor,
  IntentionReturn,
} from '@media-center/domain-driven';

const axios = Axios.create({
  baseURL: SERVER_ENDPOINT,
});
export class Beta {
  private static async makeCall<Q extends BaseIntention<any, any>>(
    path: string,
    query: Q,
  ): Promise<IntentionReturn<Q>> {
    const serialized = query.serialize();
    try {
      const {data} = await axios.post(path, {
        needing: serialized,
      });
      const deserialized = (
        query.constructor as IntentionConstructor<any, any>
      ).returning?.deserialize(data);
      return deserialized;
    } catch (e) {
      console.error('API error', e);
      throw e;
    }
  }

  static async query<Q extends BaseIntention<any, any>>(
    query: Q,
  ): Promise<IntentionReturn<Q>> {
    return Beta.makeCall(`/query/${query.constructor.name}`, query);
  }

  static async command<Q extends BaseIntention<any, any>>(
    command: Q,
  ): Promise<IntentionReturn<Q>> {
    return Beta.makeCall(`/command/${command.constructor.name}`, command);
  }
}

export function useVideoUri(hierarchyItemId: HierarchyItemId) {
  return `${SERVER_ENDPOINT}/video/${hierarchyItemId.toString()}`;
}
