import {
  useLog,
  QueryBus,
  CommandBus,
  EventBus,
} from "@media-center/domain-driven";
import Express, { urlencoded, json } from "express";
import { IntentBus } from "@media-center/domain-driven/lib/bus/intention/intentBus";
import { TimeMeasurer } from "@media-center/algorithm";
import { HierarchyStore } from "../domains/fileWatcher/applicative/hierarchy.store";
import { EnvironmentHelper } from "../domains/environment/applicative/environmentHelper";
import { HierarchyItemId } from "../domains/fileWatcher/domain/hierarchyItemId";
import { TmdbAPI } from "../domains/tmdb/applicative/tmdb.api";
import { streamVideo } from "./videoStreaming/streamVideo";
import { FilesystemEndpointCaching } from "./caching";

export function bootApi(
  queryBus: QueryBus,
  commandBus: CommandBus,
  hierarchyItemStore: HierarchyStore,
  environmentHelper: EnvironmentHelper,
  eventBus: EventBus,
  tmdbApi: TmdbAPI
) {
  const logger = useLog("Express");

  const app = Express();
  app.use(urlencoded({ extended: false }));
  app.use(json());

  const password = environmentHelper.get("SERVER_PASSWORD");
  const base64Password = Buffer.from(password).toString("base64");

  const logMiddleware = (
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ) => {
    const authorization = req.get("Authorization");
    if (!authorization) {
      logger.warn(`< ${req.path} 403`);
      return res.status(403).end();
    }
    const providedPassword = authorization.split("Bearer ")[1];
    if (providedPassword !== base64Password) {
      logger.warn(`< ${req.path} 403`);
      return res.status(403).end();
    }
    return next();
  };

  app.get("/health", (_, res) => res.status(204).end());

  app.get("/video/:hierarchyItemId", async (req, res) => {
    const hierarchyItemId = req.params.hierarchyItemId;
    const item = await hierarchyItemStore.load(
      HierarchyItemId.from(hierarchyItemId)
    );
    if (!item) {
      console.log("Didnt find item", hierarchyItemId);
      return res.status(404).end();
    }

    // const paths = {
    //   mp4: "/Users/timothee/perso/media-center/aaa/films/Avatar (2009) Hybrid MULTi VFI 2160p 10bit 4KLight DV HDR10Plus BluRay DDP 5.1 Atmos x265-QTZ.mp4",
    //   avi: "/Users/timothee/perso/media-center/aaa/films/Sorry.to.Bother.You.2018.FRENCH.BDRip.XviD-EXTREME.avi",
    //   mkv: "/Users/timothee/perso/media-center/aaa/films/Skyfall (2012) MULTI VFF 2160p 10bit 4KLight HDR BluRay x265 AAC 5.1-QTZ .mkv",
    // };
    return streamVideo(req, res, item.file.path, logger);
  });

  async function executeIntention(bus: IntentBus, name: string, params: any) {
    const ctor = bus.get(name);
    const deserialized = ctor.needing.deserialize(params);
    const instance = new ctor(deserialized);
    const result = await bus.execute(instance);

    const runtime = ctor.returning.paramToRuntime(result);
    const serialized = ctor.returning?.serialize(runtime);
    return serialized;
  }

  app.get("/query/:name", logMiddleware, async (req, res) => {
    const measure = TimeMeasurer.fromNow();
    const { name } = req.params;
    const { needing: stringifiedNeeding } = req.query;

    const needing = stringifiedNeeding
      ? JSON.parse(stringifiedNeeding as string)
      : undefined;

    logger.info(`< ${req.path}`);
    res.status(200).send(await executeIntention(queryBus, name!, needing));
    logger.info(`> ${req.path} ${measure.calc()}ms`);
  });

  app.get("/reactive/query/:name", logMiddleware, async (req, res) => {
    const { name } = req.params;
    const { needing: stringifiedNeeding } = req.query;

    const needing = stringifiedNeeding
      ? JSON.parse(stringifiedNeeding as string)
      : undefined;

    logger.info(`> reactive ${req.path}`);

    res.writeHead(200, {
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
      "Content-Type": "text/event-stream",
    });

    const ctor = queryBus.get(name!);
    const deserialized = ctor.needing.deserialize(needing);
    const instance = new ctor(deserialized);
    const unsubscribe = await queryBus.executeAndReact(
      eventBus,
      instance,
      (result, timeMs) => {
        const runtime = ctor.returning.paramToRuntime(result);
        const serialized = ctor.returning?.serialize(runtime);
        const data = JSON.stringify(serialized);
        logger.info(`  react ${req.path} ${timeMs}ms`);
        res.write(`data: ${data}\n\n`);
      }
    );

    res.on("close", () => {
      logger.info(`< reactive ${req.path}`);
      unsubscribe();
      res.end();
    });
  });

  app.post("/command/:name", logMiddleware, async (req, res) => {
    const { name } = req.params;
    const { needing } = req.body;
    const measure = TimeMeasurer.fromNow();
    logger.info(`< ${req.path}`);
    res.status(200).send(await executeIntention(commandBus, name!, needing));
    logger.info(`> reactive ${req.path} ${measure.calc()}ms`);
  });

  app.get("/event/:name", async (req, res) => {
    const { name } = req.params;

    res.writeHead(200, {
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
      "Content-Type": "text/event-stream",
    });

    const unsubscribe = eventBus.onName(name, (event) => {
      const data = JSON.stringify(event.serialize());
      res.write(`data: ${data}\n\n`);
    });

    res.on("close", () => {
      unsubscribe();
      res.end();
    });
  });

  const endpointCaching = new FilesystemEndpointCaching(environmentHelper);
  app.get("/proxy/:path", async (req, res) => {
    logger.info(`< proxy`);

    const measure = new TimeMeasurer(Date.now());

    const { path } = req.params;
    const encodedPath = encodeURIComponent(path);
    const buffer = await endpointCaching.get(encodedPath);
    if (buffer) {
      logger.info(`> proxy hit ${measure.calc()}ms`);
      return buffer.pipe(res);
    }
    const response = await tmdbApi.getAsBuffer(path);
    await endpointCaching.set(encodedPath, response);
    logger.info(`> proxy miss ${measure.calc()}ms`);
    return res.status(200).send(response);
  });

  app.listen(8080, () => {
    logger.info("Listening over port 8080");
  });
}
