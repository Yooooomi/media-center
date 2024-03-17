import { compact } from "@media-center/algorithm";
import {
  Database,
  Either,
  SQLiteStore,
  SerializableSerializer,
  Transaction,
} from "@media-center/domain-driven";
import { TmdbAPI } from "@media-center/domains/src/tmdb/applicative/tmdb.api";
import { TmdbStore } from "@media-center/domains/src/tmdb/applicative/tmdb.store";
import { AnyTmdb } from "@media-center/domains/src/tmdb/domain/anyTmdb";
import { Movie } from "@media-center/domains/src/tmdb/domain/movie";
import { Show } from "@media-center/domains/src/tmdb/domain/show";
import { TmdbId } from "@media-center/domains/src/tmdb/domain/tmdbId";

export class SQLiteTmdbStore extends SQLiteStore<AnyTmdb> implements TmdbStore {
  constructor(
    database: Database,
    private readonly tmdbAPI: TmdbAPI,
  ) {
    super(database, "tmdb", new SerializableSerializer(Either(Movie, Show)));
  }

  async load(id: TmdbId, transaction?: Transaction) {
    let existing = await super.load(id, transaction);

    if (!existing) {
      existing = await this.tmdbAPI.get(id);
      if (existing) {
        await this.save(existing, transaction);
      }
    }

    return existing;
  }

  async loadMany(ids: TmdbId[], transaction?: Transaction) {
    let existing = await super.loadMany(ids, transaction);

    const notExisting = ids.filter(
      (i) => !existing.some((e) => e.id.equals(i)),
    );

    let loaded: AnyTmdb[] = [];
    if (notExisting.length > 0) {
      loaded = compact(
        await Promise.all(notExisting.map((ne) => this.tmdbAPI.get(ne))),
      );
      await Promise.all(loaded.map((e) => this.save(e, transaction)));
    }

    return [...existing, ...loaded];
  }
}
