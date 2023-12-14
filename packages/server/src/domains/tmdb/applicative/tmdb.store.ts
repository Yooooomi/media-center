import { Store } from "@media-center/domain-driven";
import { AnyTmdb } from "../domain/anyTmdb";
import { TmdbId } from "../domain/tmdbId";

export abstract class TmdbStore extends Store<AnyTmdb, TmdbId> {}
