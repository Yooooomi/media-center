import { QueryBus } from "@media-center/domain-driven";
import { GetDeclaredUsersQueryHandler } from "./applicative/getDeclaredUsers.query";
import { EnvironmentHelper } from "../environment/applicative/environmentHelper";

export function bootUser(
  queryBus: QueryBus,
  environmentHelper: EnvironmentHelper
) {
  queryBus.register(new GetDeclaredUsersQueryHandler(environmentHelper));
}
