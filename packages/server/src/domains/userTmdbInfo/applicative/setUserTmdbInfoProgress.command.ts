import { Command, CommandHandler } from "@media-center/domain-driven";
import { UserId, UserTmdbInfoId } from "../domain/userTmdbInfoId";
import { TmdbId } from "../../tmdb/domain/tmdbId";
import { UserTmdbInfoStore } from "./userTmdbInfo.store";
import { UserTmdbInfo } from "../domain/userTmdbInfo";

export class SetUserTmdbInfoProgressCommand extends Command({
  actorId: UserId,
  tmdbId: TmdbId,
  progress: Number,
}) {}

export class SetUserTmdbInfoProgressCommandHandler extends CommandHandler(
  SetUserTmdbInfoProgressCommand
) {
  constructor(private readonly userTmdbInfoStore: UserTmdbInfoStore) {
    super();
  }

  async execute(command: SetUserTmdbInfoProgressCommand) {
    const id = UserTmdbInfoId.fromUserAndTmdb(
      command.data.actorId,
      command.data.tmdbId
    );
    const userTmdbInfo =
      (await this.userTmdbInfoStore.load(id)) ??
      new UserTmdbInfo({
        id,
        progress: 0,
      });
    userTmdbInfo.setProgress(command.data.progress);
    await this.userTmdbInfoStore.save(userTmdbInfo);
  }
}
