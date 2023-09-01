import { S, Serializer } from "../../../framework/serializer";
import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";
import { TmdbId } from "../../tmdb/domain/tmdbId";
import { CatalogEntry } from "../domain/catalogEntry";

export class V0CatalogEntrySerializer extends Serializer<CatalogEntry, TmdbId> {
  public version = 0;

  public getIdFromModel(model: CatalogEntry) {
    return model.id;
  }

  async serialize(model: CatalogEntry) {
    return {
      id: model.id.toString(),
      files: model.items.map((f) => f.toString()),
    };
  }

  async deserialize(serialized: S<Awaited<ReturnType<this["serialize"]>>>) {
    return new CatalogEntry(
      new TmdbId(serialized.id),
      serialized.files.map((f) => new HierarchyItemId(f))
    );
  }
}
