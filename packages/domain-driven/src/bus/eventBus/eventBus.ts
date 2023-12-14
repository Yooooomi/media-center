import { Constructor } from "../../types";
import { Event } from "./event";

export abstract class EventBus {
  abstract publish(event: Event<any>): void;
  abstract on<T extends Event<any>>(
    event: Constructor<T>,
    handler: (event: T) => void
  ): void;
}
