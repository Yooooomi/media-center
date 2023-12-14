import { Constructor } from "../../types";
import {
  InternalCommand,
  InternalCommandHandler,
  InternalCommandConstructor,
} from "./command";

export abstract class CommandBus {
  abstract register<C extends InternalCommand<any, any>>(
    command: Constructor<C>,
    commandHandler: InternalCommandHandler<C>
  ): void;
  abstract execute(command: InternalCommand<any, any>): Promise<any>;
  abstract getCommand(
    commandName: string
  ): InternalCommandConstructor<any, any>;
}
