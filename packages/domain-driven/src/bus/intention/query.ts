import { InMemoryIntentionBus } from "./inMemory.intentBus";
import { Intent, IntentHandler } from "./intent";
import { IntentBus } from "./intentBus";

export const Query = Intent;
export const QueryHandler = IntentHandler;
export { IntentBus as QueryBus };
export const InMemoryQueryBus = InMemoryIntentionBus;
