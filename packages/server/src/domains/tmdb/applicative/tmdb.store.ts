import { Store } from "../../../framework/store";
import { AnyTmdb } from "../domain/anyTmdb";
import { TmdbId } from "../domain/tmdbId";

export abstract class TmdbStore extends Store<AnyTmdb, TmdbId> {}
