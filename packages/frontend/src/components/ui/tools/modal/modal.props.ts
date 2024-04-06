import { ReactNode } from "react";

export interface ModalProps {
  title: string;
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  portalHostname?: string;
}
