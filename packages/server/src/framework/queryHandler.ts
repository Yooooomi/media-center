import { Query, ReturnTypeOfQuery } from "./query";

export abstract class QueryHandler<Q extends Query<any>> {
  abstract execute(query: Q): Promise<ReturnTypeOfQuery<Q>>;
}
