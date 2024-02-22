import {Buffer} from 'buffer';
import StaticAxios, {Axios} from 'axios';
import {HierarchyItemId} from '@media-center/domains/src/fileWatcher/domain/hierarchyItemId';
import {
  BaseEvent,
  BaseIntent,
  BaseIntentConstructor,
  IntentReturning,
} from '@media-center/domain-driven';
import EventSource from 'react-native-sse';
import {SerializableConstructor} from '@media-center/domain-driven/lib/serialization/types';
import {UserId} from '@media-center/domains/src/userTmdbInfo/domain/userTmdbInfoId';

export class Bridge {
  private address: string | undefined;
  private password: string | undefined;
  public userId!: UserId;
  private axios: Axios | undefined;

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.password}`,
    };
  }

  public setServer(address: string, password: string, userId?: UserId) {
    const newPassword = Buffer.from(password).toString('base64');
    this.address = address;
    this.password = newPassword;
    if (userId) {
      this.userId = userId;
    }
    this.axios = StaticAxios.create({
      baseURL: address,
      headers: this.getHeaders(),
    });
  }

  public getUrl(path: string) {
    return `${this.address}${path}`;
  }

  public getPassword() {
    return this.password;
  }

  private async makeCall<Q extends BaseIntent<any, any>>(
    path: string,
    query: Q,
    method: string,
  ): Promise<IntentReturning<Q>> {
    if (!this.axios) {
      throw new Error('Cannot make call, server not configured');
    }
    (query as any).actorId = this.userId;
    const serialized = query.serialize();
    const {data} = await this.axios.request({
      url: path,
      method,
      params:
        method === 'GET'
          ? {
              needing: JSON.stringify(serialized),
            }
          : undefined,
      data:
        method === 'POST'
          ? {
              needing: serialized,
            }
          : undefined,
    });
    const deserialized = (
      query.constructor as BaseIntentConstructor<any>
    ).returning?.deserialize(data);
    return deserialized;
  }

  async query<Q extends BaseIntent<any, any>>(
    query: Q,
  ): Promise<IntentReturning<Q>> {
    return this.makeCall(`/query/${query.constructor.name}`, query, 'GET');
  }

  reactiveQuery<Q extends BaseIntent<any, any>>(
    query: Q,
    handler: (result: IntentReturning<Q>) => void,
  ) {
    const url = new URL(
      this.getUrl(`/reactive/query/${query.constructor.name}`),
    );
    const serialized = query.serialize();
    if (serialized !== undefined) {
      url.searchParams.append('needing', JSON.stringify(query.serialize()));
    }
    const es = new EventSource(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    es.addEventListener('message', message => {
      if (!message.data) {
        return;
      }
      const deserialized = (
        query.constructor as BaseIntentConstructor<any>
      ).returning?.deserialize(JSON.parse(message.data));

      handler(deserialized);
    });

    return () => {
      es.removeAllEventListeners();
      es.close();
    };
  }

  async command<Q extends BaseIntent<any, any>>(
    command: Q,
  ): Promise<IntentReturning<Q>> {
    return this.makeCall(
      `/command/${command.constructor.name}`,
      command,
      'POST',
    );
  }

  onEvent<T extends BaseEvent<any>>(
    event: SerializableConstructor<T>,
    handler: (event: T) => void,
  ) {
    const es = new EventSource(this.getUrl(`/event/${event.name}`));

    es.addEventListener('message', message => {
      if (!message.data) {
        return;
      }
      handler(event.deserialize(JSON.parse(message.data)));
    });

    return () => {
      es.removeAllEventListeners();
      es.close();
    };
  }
}

export const Beta = new Bridge();

export function useVideoUri(hierarchyItemId: HierarchyItemId) {
  return Beta.getUrl(`/video/${hierarchyItemId.toString()}`);
}
