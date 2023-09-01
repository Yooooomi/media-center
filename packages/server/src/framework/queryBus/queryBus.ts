import { Constructor } from "../../types/utils";
import { Query } from "../query";
import { QueryHandler } from "../queryHandler";

export abstract class QueryBus {
  abstract register<C extends Query<any>>(
    command: Constructor<C>,
    commandHandler: QueryHandler<C>
  ): void;
  abstract execute(command: Query<any>): Promise<any>;
}
