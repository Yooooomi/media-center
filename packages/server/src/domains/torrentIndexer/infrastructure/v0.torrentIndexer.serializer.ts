import { S, Serializer } from "../../../framework/serializer";
import { TorrentIndexerResult } from "../domain/torrentIndexerResult";
import { TorrentIndexerResultId } from "../domain/torrentIndexerResultId";

export class V0TorrentIndexerResultSerializer extends Serializer<
  TorrentIndexerResult,
  TorrentIndexerResultId
> {
  public version = 0;

  public getIdFromModel(model: TorrentIndexerResult) {
    return model.id;
  }

  async serialize(model: TorrentIndexerResult) {
    return {
      id: model.id.toString(),
      leechers: model.leechers,
      name: model.name,
      pageUrl: model.pageUrl,
      seeders: model.seeders,
      size: model.size,
    };
  }

  async deserialize(serialized: S<Awaited<ReturnType<this["serialize"]>>>) {
    return new TorrentIndexerResult(
      new TorrentIndexerResultId(serialized.id),
      serialized.name,
      serialized.leechers,
      serialized.seeders,
      serialized.size,
      serialized.pageUrl
    );
  }
}
