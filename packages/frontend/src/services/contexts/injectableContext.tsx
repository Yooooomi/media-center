import { ComponentType, Provider, ReactNode } from "react";

interface InjectableContextProps<T> {
  provider: Provider<T>;
  value: T;
  children: ReactNode;
}

const injected: Record<symbol, ComponentType<{}>[]> = {};

export function InjectUnderContext(
  provider: Provider<any>,
  component: ComponentType<{}>,
) {
  const existing = injected[provider.prototype] ?? [];
  existing.push(component);
  injected[provider.prototype] = existing;
}

export function InjectableContext<T>({
  provider,
  children,
  value,
}: InjectableContextProps<T>) {
  const ContextProvider = provider;
  const injectedForThisContext = injected[provider.prototype];

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
