import { Query, QueryHandler } from "@media-center/domain-driven";
import { EnvironmentHelper } from "../../environment/applicative/environmentHelper";

export class GetDeclaredUsersQuery extends Query(undefined, [String]) {}

export class GetDeclaredUsersQueryHandler extends QueryHandler(
  GetDeclaredUsersQuery
) {
  constructor(private readonly environmentHelper: EnvironmentHelper) {
    super();
  }

  async execute() {
    const users = this.environmentHelper.get("AVAILABLE_USERS");
    return users.split(",");
  }
}
