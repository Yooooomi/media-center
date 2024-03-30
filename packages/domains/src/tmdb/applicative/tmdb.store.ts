import { Store } from "@media-center/domain-driven";
import { AnyTmdb } from "../domain/anyTmdb";

export abstract class TmdbStore extends Store<AnyTmdb> {}
