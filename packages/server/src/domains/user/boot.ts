import { QueryBus } from "@media-center/domain-driven";
import { EnvironmentHelper } from "../environment/applicative/environmentHelper";
import { GetDeclaredUsersQueryHandler } from "./applicative/getDeclaredUsers.query";

export function bootUser(
  queryBus: QueryBus,
  environmentHelper: EnvironmentHelper
) {
  queryBus.register(new GetDeclaredUsersQueryHandler(environmentHelper));
}
