import { FC, ReactNode } from "react";
import { HistoryItem } from "./params";

export interface RouteProps {
  path: string;
  component: FC<{}>;
}

export interface RoutesProps {
  location: HistoryItem;
}

export interface RouterProps {
  children: ReactNode;
}
