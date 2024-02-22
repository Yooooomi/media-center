import { QueryBus } from "@media-center/domain-driven";
import { EnvironmentHelper } from "@media-center/domains/src/environment/applicative/environmentHelper";
import { GetDeclaredUsersQueryHandler } from "@media-center/domains/src/user/applicative/getDeclaredUsers.query";

export function bootUser(
  queryBus: QueryBus,
  environmentHelper: EnvironmentHelper,
) {
  queryBus.register(new GetDeclaredUsersQueryHandler(environmentHelper));
}
