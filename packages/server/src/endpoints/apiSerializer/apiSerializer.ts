import { Movie } from "../../domains/tmdb/domain/movie";
import { Show } from "../../domains/tmdb/domain/show";
import { V0TmdbSerializer } from "../../domains/tmdb/infrastructure/v0.tmdb.serializer";
import { TorrentIndexerResult } from "../../domains/torrentIndexer/domain/torrentIndexerResult";
import { V0TorrentIndexerResultSerializer } from "../../domains/torrentIndexer/infrastructure/v0.torrentIndexer.serializer";
import { InfrastructureError } from "../../framework/error";
import { Serializer } from "../../framework/serializer";
import { IShape } from "../../framework/shape";

class NoSerializer extends InfrastructureError {
  constructor(className: string) {
    super(`Class ${className} could not be serialized`);
  }
}

export abstract class BridgeSerializer {
  abstract get serializers(): Map<string, Serializer<any, any>>;

  public async serialize(data: any): Promise<Record<string, any>> {
    if (!data) {
      return data;
    }

    if (Array.isArray(data)) {
      return Promise.all(data.map((d) => this.serialize(d)));
    }

    if (data instanceof IShape) {
      return {
        isShape: true,
        ...data.serialize(),
      };
    }

    const serializer = this.serializers.get(data.constructor.name);
    if (!serializer) {
      throw new NoSerializer(data.constructor.name);
    }
    return {
      dataType: data.constructor.name,
      ...(await serializer.serializeModel(data)),
    };
  }

  public async deserialize(data: any): Promise<any> {
    if (!data) {
      return data;
    }

    if (Array.isArray(data)) {
      return Promise.all(data.map((d) => this.deserialize(d)));
    }

    if (data.isShape) {
      const iShapeDeserialized = IShape.deserialize(data.hash, data);
      return iShapeDeserialized;
    }

    const serializer = this.serializers.get(data.dataType);
    if (!serializer) {
      throw new NoSerializer(data.dataType);
    }
    return serializer.deserializeModel(data);
  }
}

export class ApiSerializer extends BridgeSerializer {
  get serializers() {
    const serializers = new Map<string, Serializer<any, any>>();

    serializers.set(Movie.name, new V0TmdbSerializer());
    serializers.set(Show.name, new V0TmdbSerializer());
    serializers.set(
      TorrentIndexerResult.name,
      new V0TorrentIndexerResultSerializer()
    );

    return serializers;
  }
}
