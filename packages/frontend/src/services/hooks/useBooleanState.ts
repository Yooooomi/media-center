import { useCallback, useState } from "react";

export function useBooleanState(defaultValue?: boolean | (() => boolean)) {
  const [value, setValue] = useState(defaultValue ?? false);

  const toTrue = useCallback(() => setValue(true), []);
  const toFalse = useCallback(() => setValue(false), []);

  return [value, toTrue, toFalse] as const;
}
