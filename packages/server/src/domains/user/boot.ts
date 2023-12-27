import { QueryBus } from "@media-center/domain-driven";
import {
  GetDeclaredUsersQuery,
  GetDeclaredUsersQueryHandler,
} from "./applicative/getDeclaredUsers.query";
import { EnvironmentHelper } from "../environment/applicative/environmentHelper";

export function bootUser(
  queryBus: QueryBus,
  environmentHelper: EnvironmentHelper
) {
  queryBus.register(
    GetDeclaredUsersQuery,
    new GetDeclaredUsersQueryHandler(environmentHelper)
  );
}
