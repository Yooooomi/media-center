import { Constructor } from "../../types/utils";
import { InfrastructureError } from "../error";
import { InternalQuery, InternalQueryHandler, Query } from "../query";
import { QueryBus } from "./queryBus";

class NoHandlerFound extends InfrastructureError {
  constructor(name: string) {
    super(`Query handler for command "${name}" was not found`);
  }
}

export class InMemoryQueryBus extends QueryBus {
  private readonly registry: Record<
    string,
    InternalQueryHandler<InternalQuery<any, any, any>>
  > = {};
  private readonly ctorRegistry: Record<
    string,
    Constructor<InternalQuery<any, any, any>>
  > = {};

  async execute(query: InternalQuery<any, any, any>) {
    const handler = this.registry[query.constructor.name];
    if (!handler) {
      throw new NoHandlerFound(query.constructor.name);
    }
    return handler.execute(query);
  }

  getQuery(queryName: string) {
    const ctor = this.ctorRegistry[queryName];
    if (!ctor) {
      throw new NoHandlerFound(queryName);
    }
    return ctor;
  }

  register<C extends InternalQuery<any, any, any>>(
    command: Constructor<C>,
    commandHandler: InternalQueryHandler<C>
  ) {
    this.ctorRegistry[command.name] = command;
    this.registry[command.name] = commandHandler;
  }
}
