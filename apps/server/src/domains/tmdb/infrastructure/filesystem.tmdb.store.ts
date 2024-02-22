import { compact } from "@media-center/algorithm";
import {
  Either,
  InMemoryDatabase,
  SerializableSerializer,
} from "@media-center/domain-driven";
import { FilesystemStore } from "../../../framework/store";
import { EnvironmentHelper } from "@media-center/domains/src/environment/applicative/environmentHelper";
import { TmdbAPI } from "@media-center/domains/src/tmdb/applicative/tmdb.api";
import { TmdbStore } from "@media-center/domains/src/tmdb/applicative/tmdb.store";
import { AnyTmdb } from "@media-center/domains/src/tmdb/domain/anyTmdb";
import { Movie } from "@media-center/domains/src/tmdb/domain/movie";
import { Show } from "@media-center/domains/src/tmdb/domain/show";
import { TmdbId } from "@media-center/domains/src/tmdb/domain/tmdbId";

export class FilesystemTmdbStore
  extends FilesystemStore<AnyTmdb>
  implements TmdbStore
{
  constructor(
    environmentHelper: EnvironmentHelper,
    database: InMemoryDatabase,
    private readonly tmdbAPI: TmdbAPI
  ) {
    super(
      environmentHelper,
      database,
      "tmdb",
      new SerializableSerializer(Either(Movie, Show))
    );
  }

  async load(id: TmdbId) {
    let existing = await super.load(id);

    if (!existing) {
      existing = await this.tmdbAPI.get(id);
      if (existing) {
        await this.save(existing);
      }
    }

    return existing;
  }

  async loadMany(ids: TmdbId[]) {
    let existing = await super.loadMany(ids);

    const notExisting = ids.filter(
      (i) => !existing.some((e) => e.id.equals(i))
    );

    let loaded: AnyTmdb[] = [];
    if (notExisting.length > 0) {
      loaded = compact(
        await Promise.all(notExisting.map((ne) => this.tmdbAPI.get(ne)))
      );
      await Promise.all(loaded.map((l) => this.save(l)));
    }

    return [...existing, ...loaded];
  }
}
