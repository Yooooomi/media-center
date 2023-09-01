import { Mail } from "../../../framework/valueObjects/mail";
import { UserId } from "./userId";

export class User {
  constructor(
    public readonly id: UserId,
    public readonly mail: Mail,
    public readonly password: string
  ) {}
}
