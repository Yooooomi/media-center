import {useRef} from 'react';

export function useDebugRender(name: string) {
  const count = useRef(0);

  count.current += 1;

  console.log(`Rendered ${name}: ${count.current}`);
}
