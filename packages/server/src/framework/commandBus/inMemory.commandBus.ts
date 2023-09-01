import { Constructor } from "../../types/utils";
import { Command } from "../command";
import { CommandBus } from "./commandBus";
import { CommandHandler } from "../commandHandler";
import { InfrastructureError } from "../error";

class NoHandlerFound extends InfrastructureError {
  constructor(name: string) {
    super(`Command handler for command "${name}" was not found`);
  }
}

export class InMemoryCommandBus extends CommandBus {
  private readonly registry: Record<string, CommandHandler<Command>> = {};

  execute(command: Command<any>) {
    const handler = this.registry[command.constructor.name];
    if (!handler) {
      throw new NoHandlerFound(command.constructor.name);
    }
    return handler.execute(command);
  }

  register<C extends Command<any>>(
    command: Constructor<C>,
    commandHandler: CommandHandler<C>
  ) {
    this.registry[command.name] = commandHandler;
  }
}
