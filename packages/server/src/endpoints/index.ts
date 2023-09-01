import { Command } from "../framework/command";
import { Query } from "../framework/query";
import { Constructor, Instance } from "../types/utils";

interface GetImplementation<D, Q extends Query<any>> {
  method: "get";
  handler: (data: D) => Q;
}

interface PostImplementation<D, C extends Command<any>> {
  method: "post";
  handler: (data: D) => C;
}

export class Endpoint {
  static query<D, Q extends Constructor<Query<any>>>(
    ctor: Q,
    handler: (data: D) => readonly [...ConstructorParameters<Q>]
  ): GetImplementation<D, Instance<Q>> {
    return {
      method: "get",
      handler: (d) => new ctor(...handler(d)) as Instance<Q>,
    };
  }

  static command<D, C extends Constructor<Command<any>>>(
    ctor: C,
    handler: (data: D) => readonly [...ConstructorParameters<C>]
  ): PostImplementation<D, Instance<C>> {
    return {
      method: "post",
      handler: (d) => new ctor(...handler(d)) as Instance<C>,
    };
  }
}
