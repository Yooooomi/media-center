import {Portal as PPortal} from '@gorhom/portal';
import {ReactNode, useRef} from 'react';

export const DEFAULT_HOSTNAME = 'ROOT';

interface PortalProps {
  name?: string;
  children: ReactNode;
}

let uniqueId = 0;

export function Portal({children, name = DEFAULT_HOSTNAME}: PortalProps) {
  const ref = useRef(uniqueId++);

  return (
    <PPortal name={ref.current.toString()} hostName={name}>
      {children}
    </PPortal>
  );
}
