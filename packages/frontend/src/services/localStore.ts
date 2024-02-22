import { IsShapeConstructor } from "@media-center/domain-driven/lib/serialization/shape/mixins/objectShape";
import AsyncStorage from "@react-native-async-storage/async-storage";

abstract class LocalStore {
  protected abstract getSerialized(
    key: string,
  ): Promise<Record<string, any>> | undefined;
  protected abstract setSerialized(
    key: string,
    serialized: Record<string, any>,
  ): Promise<void>;

  public async get<I extends IsShapeConstructor<any>>(
    key: string,
    ctor: I,
  ): Promise<InstanceType<I> | undefined> {
    const serialized = await this.getSerialized(key);
    if (!serialized) {
      return undefined;
    }
    return ctor.deserialize(serialized);
  }
  public async set<I extends IsShapeConstructor<any>>(
    key: string,
    instance: InstanceType<I>,
  ): Promise<void> {
    await this.setSerialized(key, instance.serialize());
  }
}

class SharedPreferencesLocalStore extends LocalStore {
  protected async getSerialized(key: string) {
    const serialized = await AsyncStorage.getItem(key);
    if (!serialized) {
      return undefined;
    }
    return JSON.parse(serialized);
  }

  protected async setSerialized(key: string, serialized: Record<string, any>) {
    await AsyncStorage.setItem(key, JSON.stringify(serialized));
  }
}

export const localStore = new SharedPreferencesLocalStore();
