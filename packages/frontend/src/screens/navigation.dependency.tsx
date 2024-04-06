import { ComponentType } from "react";

import { Dep } from "../services/createDependency";
import {
  RouterProps,
  RoutesProps,
  UseNavigate,
  UseParams,
} from "./navigation.props";
import { NavigationParams } from "./params";

export const Routes = Dep<ComponentType<RoutesProps>>();
export const Router = Dep<ComponentType<RouterProps>>();
export const useNavigate = Dep<UseNavigate>();
export const useParams = <K extends keyof NavigationParams>() =>
  Dep<UseParams<K>>()();
