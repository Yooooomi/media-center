import { EnvironmentHelper } from "../applicative/environmentHelper";

export class ProcessEnvironmentHelper extends EnvironmentHelper {
  public getSafe(name: string) {
    return process.env[name];
  }
}
