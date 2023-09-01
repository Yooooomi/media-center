import { InMemoryStore } from "../../../framework/store";
import { TmdbAPI } from "../applicative/tmdb.api";
import { TmdbStore } from "../applicative/tmdb.store";
import { AnyTmdb } from "../domain/anyTmdb";
import { TmdbId } from "../domain/tmdbId";
import { V0TmdbSerializer } from "./v0.tmdb.serializer";

export class InMemoryTmdbStore
  extends InMemoryStore<AnyTmdb, TmdbId>
  implements TmdbStore
{
  constructor(private readonly tmdbAPI: TmdbAPI) {
    super(new V0TmdbSerializer());
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

  async loadAll(): Promise<AnyTmdb[]> {
    throw new Error("Not implemented");
  }
}
