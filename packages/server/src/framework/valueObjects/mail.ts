import { DomainError } from "@media-center/domain-driven";
import { Primitive } from "./primitive";

class MalformedEmail extends DomainError {
  constructor(mail: string) {
    super(`Mail ${mail} is malformed`);
  }
}

export class Mail extends Primitive<string> {
  validate() {
    if (this.value.includes("@")) {
      return;
    }
    throw new MalformedEmail(this.value);
  }
}
