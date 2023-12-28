import { Either, Event } from "@media-center/domain-driven";
import { MovieCatalogEntry, ShowCatalogEntry } from "../domain/catalogEntry";

export class CatalogEntryUpdated extends Event({
  catalogEntry: Either(ShowCatalogEntry, MovieCatalogEntry),
}) {}

export class CatalogEntryDeleted extends Event({
  catalogEntry: Either(ShowCatalogEntry, MovieCatalogEntry),
}) {}
