import { Constructor } from "../../serialization";
import { BaseEvent } from "./event";

export abstract class EventBus {
  abstract publish(event: BaseEvent<any>): void;
  abstract on<T extends BaseEvent<any>>(
    event: Constructor<T>,
    handler: (event: T) => void
  ): () => void;
  abstract onName(
    name: string,
    handler: (event: BaseEvent<any>) => void
  ): () => void;
}
