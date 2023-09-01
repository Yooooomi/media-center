import { InMemoryStore } from "../../../framework/store";
import { Mail } from "../../../framework/valueObjects/mail";
import { UserStore } from "../applicative/user.store";
import { User } from "../domain/user";
import { UserId } from "../domain/userId";
import { V0UserSerializer } from "./v0.userSerializer";

export class InMemoryUserStore
  extends InMemoryStore<User, UserId>
  implements UserStore
{
  constructor() {
    super(new V0UserSerializer());
  }

  async loadByMail(mail: Mail) {
    return (await this.filter((user) => user.mail.equals(mail)))[0];
  }
}
