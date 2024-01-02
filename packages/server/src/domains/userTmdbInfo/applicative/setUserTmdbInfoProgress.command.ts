import { Command, CommandHandler, Optional } from "@media-center/domain-driven";
import { UserId, UserTmdbInfoId } from "../domain/userTmdbInfoId";
import { TmdbId } from "../../tmdb/domain/tmdbId";
import { UserTmdbInfoStore } from "./userTmdbInfo.store";
import { TmdbStore } from "../../tmdb/applicative/tmdb.store";
import { Movie } from "../../tmdb/domain/movie";
import { Show } from "../../tmdb/domain/show";
import {
  AnyUserTmdbInfo,
  UserTmdbMovieInfo,
  UserTmdbShowInfo,
} from "../domain/userTmdbInfo";

export class SetUserTmdbInfoProgressCommand extends Command({
  actorId: UserId,
  tmdbId: TmdbId,
  progress: Number,
  season: Optional(Number),
  episode: Optional(Number),
}) {}

export class SetUserTmdbInfoProgressCommandHandler extends CommandHandler(
  SetUserTmdbInfoProgressCommand
) {
  constructor(
    private readonly tmdbStore: TmdbStore,
    private readonly userTmdbInfoStore: UserTmdbInfoStore
  ) {
    super();
  }

  async execute(command: SetUserTmdbInfoProgressCommand) {
    const tmdb = await this.tmdbStore.load(command.tmdbId);
    const id = new UserTmdbInfoId(command.actorId, command.tmdbId);
    let userTmdbInfo: AnyUserTmdbInfo | undefined;

    if (tmdb instanceof Movie) {
      userTmdbInfo =
        (await this.userTmdbInfoStore.load(id)) ??
        new UserTmdbMovieInfo({
          id,
          progress: 0,
          updatedAt: Date.now(),
        });
      if (!(userTmdbInfo instanceof UserTmdbMovieInfo)) {
        throw new Error("Inconsistent state");
      }
      userTmdbInfo.setProgress(command.progress);
    } else if (tmdb instanceof Show) {
      if (command.season === undefined || command.episode === undefined) {
        throw new Error(
          "Must pass season and episode when marking show episode progress"
        );
      }
      userTmdbInfo =
        (await this.userTmdbInfoStore.load(id)) ??
        new UserTmdbShowInfo({
          id,
          progress: [],
          updatedAt: Date.now(),
        });
      if (!(userTmdbInfo instanceof UserTmdbShowInfo)) {
        throw new Error("Inconsistent state");
      }
      userTmdbInfo.setEpisodeProgress(
        command.season,
        command.episode,
        command.progress
      );
    }

    if (!userTmdbInfo) {
      return;
    }
    await this.userTmdbInfoStore.save(userTmdbInfo);
  }
}
