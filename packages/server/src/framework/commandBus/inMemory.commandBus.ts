import { Constructor } from "../../types/utils";
import { InfrastructureError } from "../error";
import { InternalCommand, InternalCommandHandler, Command } from "../command";
import { CommandBus } from "./commandBus";

class NoHandlerFound extends InfrastructureError {
  constructor(name: string) {
    super(`Command handler for command "${name}" was not found`);
  }
}

export class InMemoryCommandBus extends CommandBus {
  private readonly registry: Record<
    string,
    InternalCommandHandler<InternalCommand<any, any, any>>
  > = {};
  private readonly ctorRegistry: Record<
    string,
    Constructor<InternalCommand<any, any, any>>
  > = {};

  async execute(command: InternalCommand<any, any, any>) {
    const handler = this.registry[command.constructor.name];
    if (!handler) {
      throw new NoHandlerFound(command.constructor.name);
    }
    return handler.execute(command);
  }

  getCommand(commandName: string) {
    const ctor = this.ctorRegistry[commandName];
    if (!ctor) {
      throw new NoHandlerFound(commandName);
    }
    return ctor;
  }

  register<C extends InternalCommand<any, any, any>>(
    command: Constructor<C>,
    commandHandler: InternalCommandHandler<C>
  ) {
    this.ctorRegistry[command.name] = command;
    this.registry[command.name] = commandHandler;
  }
}
