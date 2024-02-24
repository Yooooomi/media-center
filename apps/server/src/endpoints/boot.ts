import {
  useLog,
  QueryBus,
  CommandBus,
  EventBus,
} from "@media-center/domain-driven";
import Express, { urlencoded, json } from "express";
import { IntentBus } from "@media-center/domain-driven/src/bus/intention/intentBus";
import { TimeMeasurer } from "@media-center/algorithm";
import { HierarchyStore } from "@media-center/domains/src/fileWatcher/applicative/hierarchy.store";
import { EnvironmentHelper } from "@media-center/domains/src/environment/applicative/environmentHelper";
import { HierarchyItemId } from "@media-center/domains/src/fileWatcher/domain/hierarchyItemId";
import { TmdbAPI } from "@media-center/domains/src/tmdb/applicative/tmdb.api";
import { SubtitleStore } from "@media-center/domains/src/hierarchyEntryInformation/applicative/subtitle.store";
import { streamVideo } from "./videoStreaming/streamVideo";
import { FilesystemEndpointCaching } from "./caching";

export function bootApi(
  queryBus: QueryBus,
  commandBus: CommandBus,
  hierarchyItemStore: HierarchyStore,
  environmentHelper: EnvironmentHelper,
  eventBus: EventBus,
  tmdbApi: TmdbAPI,
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
    next: Express.NextFunction,
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

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.header("origin")); // Allow requests from any origin
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    ); // Allow the specified HTTP methods
    res.header(
      "Access-Control-Allow-Headers",
      "Authorization, Origin, X-Requested-With, Content-Type, Accept",
    );
    res.header("Access-Control-Allow-Credentials", "true");
    next();
  });

  app.get("/health", (_, res) => res.status(204).end());

  app.get("/video/:hierarchyItemId", async (req, res) => {
    const hierarchyItemId = req.params.hierarchyItemId;
    const item = await hierarchyItemStore.load(
      HierarchyItemId.from(hierarchyItemId),
    );
    if (!item) {
      console.log("Didnt find item", hierarchyItemId);
      return res.status(404).end();
    }
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
      },
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

    res.set("Cache-Control", "public, max-age=31536000, immutable");

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
