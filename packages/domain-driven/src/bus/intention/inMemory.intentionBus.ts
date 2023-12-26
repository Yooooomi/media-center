import {
  BaseIntention,
  BaseIntentionHandler,
  Constructor,
  Definition,
  DictShorthand,
  IntentionConstructor,
} from "../..";
import { InfrastructureError } from "../../error";
import { IntentionBus } from "./intentionBus";

class NoHandlerFound extends InfrastructureError {
  constructor(name: string) {
    super(`Command handler for command "${name}" was not found`);
  }
}

export class InMemoryIntentionBus extends IntentionBus {
  private readonly registry: Record<
    string,
    BaseIntentionHandler<BaseIntention<Definition, Definition>>
  > = {};
  private readonly ctorRegistry: Record<
    string,
    IntentionConstructor<DictShorthand, DictShorthand>
  > = {};

  async execute(command: BaseIntention<Definition, Definition>) {
    const handler = this.registry[command.constructor.name];
    if (!handler) {
      throw new NoHandlerFound(command.constructor.name);
    }
    return handler.execute(command);
  }

  get(commandName: string) {
    const ctor = this.ctorRegistry[commandName];
    if (!ctor) {
      throw new NoHandlerFound(commandName);
    }
    return ctor;
  }

  register<C extends BaseIntention<Definition, Definition>>(
    command: Constructor<C>,
    commandHandler: BaseIntentionHandler<C>
  ) {
    this.ctorRegistry[command.name] = command as any;
    this.registry[command.name] = commandHandler as any;
  }
}
