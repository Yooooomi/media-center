import { DomainError, Id } from "@media-center/domain-driven";

export type TmdbIdType = "show" | "movie";

class MalformedTmdbId extends DomainError {
  constructor(value: string) {
    super(`TmdbId ${value} is malformed`);
  }
}

export class TmdbId extends Id {
  static fromIdAndType(id: string, type: TmdbIdType) {
    return new TmdbId(`${type}:${id}`);
  }

  public getType() {
    return this.value.split(":")[0]! as TmdbIdType;
  }

  validate() {
    const [type, id] = this.value.split(":");
    if ((type !== "show" && type !== "movie") || !id) {
      throw new MalformedTmdbId(this.value);
    }
  }

  toRealId() {
    return this.value.split(":")[1]!;
  }
}
