import { InfrastructureError } from "../../error";
import { Definition } from "../../serialization";
import { BaseIntent, BaseIntentConstructor, BaseIntentHandler } from "./intent";
import { IntentBus } from "./intentBus";

class NoHandlerFound extends InfrastructureError {
  constructor(name: string) {
    super(`Command handler for command "${name}" was not found`);
  }
}

export class InMemoryIntentionBus extends IntentBus {
  private readonly handlerRegistry: Record<string, BaseIntentHandler<any>> = {};
  private readonly intentRegistry: Record<string, BaseIntentConstructor<any>> =
    {};

  async execute(intent: BaseIntent<Definition, Definition>) {
    const handler = this.handlerRegistry[intent.constructor.name];
    if (!handler) {
      throw new NoHandlerFound(intent.constructor.name);
    }
    return handler.execute(intent);
  }

  get(commandName: string) {
    const ctor = this.intentRegistry[commandName];
    if (!ctor) {
      throw new NoHandlerFound(commandName);
    }
    return ctor;
  }

  register(commandHandler: BaseIntentHandler<any>) {
    this.intentRegistry[commandHandler.intent.name] = commandHandler.intent;
    this.handlerRegistry[commandHandler.intent.name] = commandHandler;
  }
}
