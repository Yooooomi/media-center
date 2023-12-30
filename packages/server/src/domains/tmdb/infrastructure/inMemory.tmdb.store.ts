import { compact } from "@media-center/algorithm";
import { TmdbAPI } from "../applicative/tmdb.api";
import { TmdbStore } from "../applicative/tmdb.store";
import { AnyTmdb } from "../domain/anyTmdb";
import { Movie } from "../domain/movie";
import { Show } from "../domain/show";
import { TmdbId } from "../domain/tmdbId";
import {
  Either,
  InMemoryDatabase,
  InMemoryStore,
  SerializableSerializer,
} from "@media-center/domain-driven";

export class InMemoryTmdbStore
  extends InMemoryStore<AnyTmdb>
  implements TmdbStore
{
  constructor(database: InMemoryDatabase, private readonly tmdbAPI: TmdbAPI) {
    super(database, "tmdb", new SerializableSerializer(Either(Movie, Show)));
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
    }

    return [...existing, ...loaded];
  }
}
