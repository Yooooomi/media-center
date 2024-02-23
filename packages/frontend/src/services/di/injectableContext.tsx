import { ComponentType, Provider, ReactNode } from "react";

interface InjectableContextProps<T> {
  provider: Provider<T>;
  value: T;
  children: ReactNode;
}

const injected: Map<symbol, ComponentType<{}>[]> = new Map();

export function InjectUnderContext(
  provider: Provider<any>,
  component: ComponentType<{}>,
) {
  const existing = injected.get(provider.prototype) ?? [];
  existing.push(component);
  injected.set(provider.prototype, existing);
}

export function InjectableContext<T>({
  provider,
  children,
  value,
}: InjectableContextProps<T>) {
  const ContextProvider = provider;
  const injectedForThisContext = injected.get(provider.prototype);

  return (
    <ContextProvider value={value}>
      <>
        {injectedForThisContext?.map((Component, index) => (
          <Component key={index} />
        )) ?? null}
      </>
      {children}
    </ContextProvider>
  );
}
