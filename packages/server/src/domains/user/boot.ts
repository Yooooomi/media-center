import { CommandBus } from "../../framework/commandBus/commandBus";
import {
  CreateUserCommand,
  CreateUserCommandHandler,
} from "./applicative/createUser.command";
import { InMemoryUserStore } from "./infrastructure/inMemory.userStore";

export function bootUser(commandBus: CommandBus) {
  const userStore = new InMemoryUserStore();
  commandBus.register(
    CreateUserCommand,
    new CreateUserCommandHandler(userStore)
  );

  return { userStore };
}
