import { Store } from "../../../framework/store";
import { Mail } from "../../../framework/valueObjects/mail";
import { User } from "../domain/user";
import { UserId } from "../domain/userId";

export abstract class UserStore extends Store<User, UserId> {
  abstract loadByMail(mail: Mail): Promise<User | undefined>;
}
