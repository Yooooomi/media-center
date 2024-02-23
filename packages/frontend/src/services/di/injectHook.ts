export const HOOKS = {
  OnFirstAddedRecently: 0,
  OnLoginError: 1,
} as const;

type HookName = keyof typeof HOOKS;

const registers: Partial<Record<HookName, (() => void)[]>> = {};

export const DI_HOOKS = {
  hooks: HOOKS,
  register: (hook: HookName, fn: () => void) => {
    const existing = registers[hook] ?? [];
    existing.push(fn);
    registers[hook] = existing;
  },
  unregister: (hook: HookName, fn: () => void) => {
    const existing = registers[hook];
    if (!existing) {
      return;
    }
    const index = existing.indexOf(fn);
    if (index < 0) {
      return;
    }
    existing.splice(index, 1);
  },
  trigger: (hook: HookName) => {
    registers[hook]?.forEach((fn) => fn());
  },
};
