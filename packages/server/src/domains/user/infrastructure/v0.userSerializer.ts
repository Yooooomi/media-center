import { S, Serializer } from "../../../framework/serializer";
import { Mail } from "../../../framework/valueObjects/mail";
import { User } from "../domain/user";
import { UserId } from "../domain/userId";

export class V0UserSerializer extends Serializer<User, UserId> {
  version = 0;

  public getIdFromModel(model: User) {
    return model.id;
  }

  async serialize(model: User) {
    return {
      id: model.id.toString(),
      mail: model.mail.toString(),
      password: model.password,
    };
  }

  async deserialize(
    serialized: S<Awaited<ReturnType<this["serialize"]>>>
  ): Promise<User> {
    return new User(
      new UserId(serialized.id),
      new Mail(serialized.mail),
      serialized.password
    );
  }
}
