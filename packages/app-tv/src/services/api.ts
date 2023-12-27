import StaticAxios, {Axios} from 'axios';
import {HierarchyItemId} from '@media-center/server/src/domains/fileWatcher/domain/hierarchyItemId';
import {
  BaseEvent,
  BaseIntention,
  IntentionConstructor,
  IntentionReturn,
} from '@media-center/domain-driven';
import {Buffer} from 'buffer';
import EventSource from 'react-native-sse';
import {SerializableConstructor} from '@media-center/domain-driven/lib/serialization/types';

export class Bridge {
  private address: string | undefined;
  private password: string | undefined;
  private axios: Axios | undefined;

  public setServer(address: string, password: string) {
    const newPassword = Buffer.from(password).toString('base64');
    this.axios = StaticAxios.create({
      baseURL: address,
      headers: {
        Authorization: `Bearer ${newPassword}`,
      },
    });
    this.address = address;
    this.password = newPassword;
  }

  public getUrl(path: string) {
    return `${this.address}${path}`;
  }

  public getPassword() {
    return this.password;
  }

  private async makeCall<Q extends BaseIntention<any, any>>(
    path: string,
    query: Q,
  ): Promise<IntentionReturn<Q>> {
    if (!this.axios) {
      throw new Error('Cannot make call, server not configured');
    }
    const serialized = query.serialize();
    try {
      const {data} = await this.axios.post(path, {
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

  async query<Q extends BaseIntention<any, any>>(
    query: Q,
  ): Promise<IntentionReturn<Q>> {
    return this.makeCall(`/query/${query.constructor.name}`, query);
  }

  async command<Q extends BaseIntention<any, any>>(
    command: Q,
  ): Promise<IntentionReturn<Q>> {
    return this.makeCall(`/command/${command.constructor.name}`, command);
  }

  onEvent<T extends BaseEvent<any>>(
    event: SerializableConstructor<T>,
    handler: (event: T) => void,
  ) {
    console.log('onEvent', event.name);
    const es = new EventSource(this.getUrl(`/event/${event.name}`), {
      debug: true,
      method: 'GET',
    });

    es.addEventListener('open', () => {
      console.log('Opened');
    });

    es.addEventListener('close', () => {
      console.log('Closed');
    });

    es.addEventListener('error', error => {
      console.log('error', error);
    });

    es.addEventListener('message', message => {
      console.log('New message', message);
      if (!message.data) {
        return;
      }
      handler(event.deserialize(JSON.parse(message.data)));
    });

    es.open();

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
