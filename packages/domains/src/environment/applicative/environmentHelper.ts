import { ApplicativeError } from "@media-center/domain-driven";

class ValueNotFound extends ApplicativeError {
  constructor(variableName: string) {
    super(`Variable ${variableName} was not found`);
  }
}

class MatcherNotFound extends ApplicativeError {
  constructor(variable: string, matcher: string) {
    super(
      `Matcher with value ${matcher} for variable ${variable} was not found`,
    );
  }
}

export abstract class EnvironmentHelper {
  public get(name: string): string {
    const value = this.getSafe(name);
    if (!value) {
      throw new ValueNotFound(name);
    }
    return value;
  }

  public abstract getSafe(name: string): string | undefined;

  public match<R extends Record<string, any>>(
    name: string,
    matches: R,
  ): R extends Record<string, infer K extends (...args: any[]) => any>
    ? ReturnType<K>
    : never | undefined {
    const value = this.get(name);
    const matcher = matches[value];
    if (!matcher) {
      throw new MatcherNotFound(name, value);
    }
    return matcher();
  }
}
