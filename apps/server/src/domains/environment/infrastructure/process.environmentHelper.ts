import { EnvironmentHelper } from "@media-center/domains/src/environment/applicative/environmentHelper";

export class ProcessEnvironmentHelper extends EnvironmentHelper {
  public getSafe(name: string) {
    return process.env[name];
  }
}
