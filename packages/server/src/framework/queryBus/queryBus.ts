import { Constructor } from "../../types/utils";
import {
  InternalQuery,
  InternalQueryConstructor,
  InternalQueryHandler,
} from "../query";

export abstract class QueryBus {
  abstract register<C extends InternalQuery<any, any>>(
    query: Constructor<C>,
    queryHandler: InternalQueryHandler<C>
  ): void;
  abstract execute(query: InternalQuery<any, any>): Promise<any>;
  abstract getQuery(queryName: string): InternalQueryConstructor<any, any>;
}
