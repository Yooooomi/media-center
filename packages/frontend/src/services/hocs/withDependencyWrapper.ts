import React, { FunctionComponent } from "react";

export function withDependencyWrapper<P extends {}, D extends Partial<P>>(
  Component: FunctionComponent<P>,
  prepareDependencies: (props: P) => D | undefined,
  options?: {
    Fallback?: FunctionComponent;
  },
): FunctionComponent<Omit<P, keyof D>> {
  return (props: Omit<P, keyof D>) => {
    const dependencies = prepareDependencies(props as P);

    if (!dependencies) {
      return options?.Fallback ? React.createElement(options.Fallback) : null;
    }

    const finalProps = { ...props, ...dependencies };

    return React.createElement(Component, finalProps as unknown as P);
  };
}
