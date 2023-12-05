import { HierarchyStore } from "../domains/fileWatcher/applicative/hierarchy.store";
import { HierarchyItemId } from "../domains/fileWatcher/domain/hierarchyItemId";
import { CommandBus } from "../framework/commandBus/commandBus";
import { QueryBus } from "../framework/queryBus/queryBus";
import { useLog } from "../framework/useLog";
import Express, { urlencoded, json } from "express";
import * as fs from "fs";

export function bootApi(
  queryBus: QueryBus,
  commandBus: CommandBus,
  hierarchyItemStore: HierarchyStore
) {
  const logger = useLog("Express");

  const app = Express();
  app.use(urlencoded({ extended: false }));
  app.use(json());

  app.get("/video/:hierarchyItemId", async (req, res) => {
    // const hierarchyItemId = req.params.hierarchyItemId;
    // logger.info("Trying to get video", hierarchyItemId);
    // const item = await hierarchyItemStore.load(
    //   HierarchyItemId.from(hierarchyItemId)
    // );
    // if (!item) {
    //   console.log("Didnt find item", hierarchyItemId);
    //   return res.status(404).end();
    // }
    const { range } = req.headers;

    if (!range) {
      console.log("Didnt find range");
      return res.status(400).end();
    }

    const path =
      "/Users/timothee/perso/media-center/aaa/films/Skyfall (2012) MULTI VFF 2160p 10bit 4KLight HDR BluRay x265 AAC 5.1-QTZ .mkv";
    // const path = "/Users/timothee/perso/media-center/aaa/films/sample.mkv";
    // const path = item.file.path;
    const total = fs.statSync(path).size;

    console.log("RANGE", range);
    const [startString, endString] = range.replace(/bytes=/, "").split("-");

    if (!startString) {
      return res.status(400).end();
    }

    const start = parseInt(startString, 10);
    // if last byte position is not present then it is the last byte of the video file.
    const end = endString ? parseInt(endString, 10) : total - 1;
    const chunksize = end - start + 1;
    console.log("Sending chunk size", start, end, chunksize);

    res.writeHead(206, {
      "Content-Range": "bytes " + start + "-" + end + "/" + total,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/x-matroska",
    });

    fs.createReadStream(path, {
      start,
      end,
    }).pipe(res);
  });

  app.post("/query/:name", async (req, res) => {
    const { name } = req.params;
    const { needing } = req.body;

    logger.info(`< ${req.path}`);

    const ctor = queryBus.getQuery(name);
    const deserialized = ctor.needing?.deserialize(needing);
    const query = new ctor(deserialized);
    const result = await queryBus.execute(query);
    res.status(200).send(ctor.returning?.serialize(result));
    logger.info(`> ${req.path}`);
  });

  app.post("/command/:name", async (req, res) => {
    const { name } = req.params;
    const { needing } = req.body;

    logger.info(`< ${req.path}`);

    const ctor = commandBus.getCommand(name);
    const deserialized = ctor.needing?.deserialize(needing);
    const command = new ctor(deserialized);
    const result = await commandBus.execute(command);
    res.status(200).send(ctor.returning?.serialize(result));
    logger.info(`> ${req.path}`);
  });

  app.listen(8080, () => {
    logger.info("Listening over port 8080");
  });
}
