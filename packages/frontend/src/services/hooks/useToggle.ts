import { useCallback, useState } from "react";

export function useToggle(defaultValue?: boolean) {
  const [value, setValue] = useState(defaultValue ?? false);

  const roll = useCallback(() => setValue((o) => !o), []);

  return [value, roll, setValue] as const;
}
