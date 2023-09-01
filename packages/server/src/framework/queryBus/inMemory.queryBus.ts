import { Constructor } from "../../types/utils";
import { InfrastructureError } from "../error";
import { Query } from "../query";
import { QueryHandler } from "../queryHandler";
import { QueryBus } from "./queryBus";

class NoHandlerFound extends InfrastructureError {
  constructor(name: string) {
    super(`Query handler for command "${name}" was not found`);
  }
}

export class InMemoryQueryBus extends QueryBus {
  private readonly registry: Record<string, QueryHandler<Query<any>>> = {};

  async execute(query: Query<any>) {
    const handler = this.registry[query.constructor.name];
    if (!handler) {
      throw new NoHandlerFound(query.constructor.name);
    }
    return handler.execute(query);
  }

  register<C extends Query<any>>(
    command: Constructor<C>,
    commandHandler: QueryHandler<C>
  ) {
    this.registry[command.name] = commandHandler;
  }
}
