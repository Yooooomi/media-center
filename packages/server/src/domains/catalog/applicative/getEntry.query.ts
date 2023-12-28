import {
  ApplicativeError,
  Query,
  Optional,
  Either,
  QueryHandler,
} from "@media-center/domain-driven";
import { HierarchyStore } from "../../fileWatcher/applicative/hierarchy.store";
import { TmdbId } from "../../tmdb/domain/tmdbId";
import { MovieCatalogEntry, ShowCatalogEntry } from "../domain/catalogEntry";
import { CatalogEntryStore } from "./catalogEntry.store";
import {
  CatalogEntryMovieSpecificationFulFilled,
  CatalogEntryShowSpecificationFulFilled,
  MovieCatalogEntryFulfilled,
  ShowCatalogEntryFulfilled,
} from "./catalogEntryFulfilled.front";

class UnknownEntry extends ApplicativeError {
  constructor(name: string) {
    super(`Unknown entry type ${name}`);
  }
}

export class GetEntryQuery extends Query(
  {
    tmdbId: TmdbId,
  },
  Optional(Either(ShowCatalogEntryFulfilled, MovieCatalogEntryFulfilled))
) {}

export class GetEntryQueryHandler extends QueryHandler(GetEntryQuery) {
  constructor(
    private readonly catalogEntryStore: CatalogEntryStore,
    private readonly hierarchyItemStore: HierarchyStore
  ) {
    super();
  }

  async execute(query: GetEntryQuery) {
    const entry = await this.catalogEntryStore.load(query.tmdbId);

    if (!entry) {
      return undefined;
    }

    const items = await this.hierarchyItemStore.loadMany(
      entry.items.map((i) => i.id)
    );

    if (entry instanceof ShowCatalogEntry) {
      return new ShowCatalogEntryFulfilled({
        id: entry.id,
        items: entry.items.map(
          (e, i) =>
            new CatalogEntryShowSpecificationFulFilled({
              item: items[i]!,
              season: e.season,
              episode: e.episode,
            })
        ),
      });
    } else if (entry instanceof MovieCatalogEntry) {
      return new MovieCatalogEntryFulfilled({
        id: entry.id,
        items: entry.items.map(
          (e, i) =>
            new CatalogEntryMovieSpecificationFulFilled({
              item: items[i]!,
            })
        ),
      });
    }
    throw new UnknownEntry((entry as any).constructor.name);
  }
}
