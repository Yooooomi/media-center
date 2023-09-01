import { Constructor } from "../../types/utils";
import { Command } from "../command";
import { CommandHandler } from "../commandHandler";

export abstract class CommandBus {
  abstract register<C extends Command>(
    command: Constructor<C>,
    commandHandler: CommandHandler<C>
  ): void;
  abstract execute(command: Command): void;
}
