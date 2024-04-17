import { FC, ReactNode } from "react";

import { NavigationParams } from "./params";

export interface RouteProps {
  path: string;
  component: FC<{}>;
}

export interface RoutesProps {}

export interface RouterProps {
  children: ReactNode;
}

export interface UseNavigate {
  (): {
    navigate: <K extends keyof NavigationParams>(
      path: K,
      params: NavigationParams[K] extends undefined
        ? void
        : NavigationParams[K],
    ) => void;
    goBack: () => void;
  };
}

export type UseParams<K extends keyof NavigationParams> =
  () => NavigationParams[K];
