import { Command, ReturnTypeOfCommand } from "./command";

export abstract class CommandHandler<C extends Command> {
  abstract execute(command: C): Promise<ReturnTypeOfCommand<C>>;
}
