import { InMemoryIntentionBus } from "./inMemory.intentionBus";
import { Intention, IntentionHandler } from "./intention";
import { IntentionBus } from "./intentionBus";

export const Query = Intention;
export const QueryHandler = IntentionHandler;
export { IntentionBus as QueryBus };
export const InMemoryQueryBus = InMemoryIntentionBus;
