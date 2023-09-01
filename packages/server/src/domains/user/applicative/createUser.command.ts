import { Command } from "../../../framework/command";
import { CommandHandler } from "../../../framework/commandHandler";
import { ApplicativeError } from "../../../framework/error";
import { Mail } from "../../../framework/valueObjects/mail";
import { User } from "../domain/user";
import { UserId } from "../domain/userId";
import { UserStore } from "./user.store";

export class CreateUserCommand extends Command {
  constructor(public readonly mail: Mail, public readonly password: string) {
    super();
  }
}

class AlreadyExistingUser extends ApplicativeError {
  constructor(mail: Mail) {
    super(`Mail ${mail.toString()} is already taken`);
  }
}

export class CreateUserCommandHandler extends CommandHandler<CreateUserCommand> {
  constructor(private readonly userStore: UserStore) {
    super();
  }

  async execute(command: CreateUserCommand) {
    const alreadyExisting = await this.userStore.loadByMail(command.mail);

    if (alreadyExisting) {
      throw new AlreadyExistingUser(command.mail);
    }

    const newUser = new User(UserId.generate(), command.mail, command.password);
    await this.userStore.save(newUser);
  }
}
