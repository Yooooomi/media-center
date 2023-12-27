import {useCallback, useState} from 'react';

export function useRender() {
  const [_, setRefresh] = useState(0);
  return useCallback(() => setRefresh(o => o + 1), []);
}
