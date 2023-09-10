import { Command, CommandHandler } from "../../../framework/command";
import { ApplicativeError } from "../../../framework/error";
import { Shape } from "../../../framework/shape";
import { Mail } from "../../../framework/valueObjects/mail";
import { User } from "../domain/user";
import { UserId } from "../domain/userId";
import { UserStore } from "./user.store";

export class CreateUserCommand extends Command({
  needing: Shape({
    mail: Mail,
    password: String,
  }),
}) {}

class AlreadyExistingUser extends ApplicativeError {
  constructor(mail: Mail) {
    super(`Mail ${mail.toString()} is already taken`);
  }
}

export class CreateUserCommandHandler extends CommandHandler(
  CreateUserCommand
) {
  constructor(private readonly userStore: UserStore) {
    super();
  }

  async execute(command: CreateUserCommand) {
    const alreadyExisting = await this.userStore.loadByMail(command.data.mail);

    if (alreadyExisting) {
      throw new AlreadyExistingUser(command.data.mail);
    }

    const newUser = new User(
      UserId.generate(),
      command.data.mail,
      command.data.password
    );
    await this.userStore.save(newUser);
  }
}
