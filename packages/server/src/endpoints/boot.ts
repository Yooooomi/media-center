import {
  useLog,
  QueryBus,
  CommandBus,
  EventBus,
} from "@media-center/domain-driven";
import { HierarchyStore } from "../domains/fileWatcher/applicative/hierarchy.store";
import Express, { urlencoded, json } from "express";
import * as fs from "fs";
import { EnvironmentHelper } from "../domains/environment/applicative/environmentHelper";
import { HierarchyItemId } from "../domains/fileWatcher/domain/hierarchyItemId";
import { IntentBus } from "@media-center/domain-driven/lib/bus/intention/intentBus";

export function bootApi(
  queryBus: QueryBus,
  commandBus: CommandBus,
  hierarchyItemStore: HierarchyStore,
  environmentHelper: EnvironmentHelper,
  eventBus: EventBus
) {
  const logger = useLog("Express");

  const app = Express();
  app.use(urlencoded({ extended: false }));
  app.use(json());

  const password = environmentHelper.get("API_KEY");
  const base64Password = Buffer.from(password).toString("base64");

  const logMiddleware = (
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ) => {
    const authorization = req.get("Authorization");
    if (!authorization) {
      return res.status(403).end();
    }
    const password = authorization.split("Bearer ")[1];
    if (password !== base64Password) {
      return res.status(403).end();
    }
    return next();
  };

  app.get("/video/:hierarchyItemId", async (req, res) => {
    const hierarchyItemId = req.params.hierarchyItemId;
    const item = await hierarchyItemStore.load(
      HierarchyItemId.from(hierarchyItemId)
    );
    if (!item) {
      console.log("Didnt find item", hierarchyItemId);
      return res.status(404).end();
    }
    const { range } = req.headers;

    if (!range) {
      console.log("Didnt find range");
      return res.status(400).end();
    }

    // const path =
    //   "/data/movie/Skyfall (2012) MULTI VFF 2160p 10bit 4KLight HDR BluRay x265 AAC 5.1-QTZ .mkv";
    // const path = "/Users/timothee/perso/media-center/aaa/films/sample.mkv";
    const path = item.file.path;
    const total = fs.statSync(path).size;

    const [startString, endString] = range.replace(/bytes=/, "").split("-");

    if (!startString) {
      return res.status(400).end();
    }

    const start = parseInt(startString, 10);
    // if last byte position is not present then it is the last byte of the video file.
    const end = endString ? parseInt(endString, 10) : total - 1;
    const chunksize = end - start + 1;

    res.writeHead(206, {
      "Content-Range": "bytes " + start + "-" + end + "/" + total,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/x-matroska",
    });

    return fs
      .createReadStream(path, {
        start,
        end,
      })
      .pipe(res);
  });

  async function executeIntention(
    bus: IntentBus,
    name: string,
    params: Record<string, any>
  ) {
    const ctor = bus.get(name);
    const deserialized = ctor.needing.deserialize(params);
    const instance = new ctor(deserialized);
    const result = await bus.execute(instance);

    const runtime = ctor.returning.paramToRuntime(result);
    const serialized = ctor.returning?.serialize(runtime);
    return serialized;
  }

  app.post("/query/:name", logMiddleware, async (req, res) => {
    const { name } = req.params;
    const { needing } = req.body;
    logger.info(`< ${req.path}`);
    res.status(200).send(await executeIntention(queryBus, name!, needing));
    logger.info(`> ${req.path}`);
  });

  app.post("/command/:name", logMiddleware, async (req, res) => {
    const { name } = req.params;
    const { needing } = req.body;
    logger.info(`< ${req.path}`);
    res.status(200).send(await executeIntention(commandBus, name!, needing));
    logger.info(`> ${req.path}`);
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

  app.listen(8080, () => {
    logger.info("Listening over port 8080");
  });
}
