import { CommandBus } from "../framework/commandBus/commandBus";
import { QueryBus } from "../framework/queryBus/queryBus";
import { useLog } from "../framework/useLog";
import { ApiSerializer } from "./apiSerializer/apiSerializer";
import * as v1 from "./v1";
import Express, { urlencoded, json } from "express";

const app = Express();
app.use(urlencoded({ extended: false }));
app.use(json());

export function bootApi(queryBus: QueryBus, commandBus: CommandBus) {
  const bridgeSerializer = new ApiSerializer();
  const logger = useLog("Express");

  Object.entries(v1).forEach(([endpointName, implementation]) => {
    if (implementation.method === "get") {
      app.get(`/${endpointName}`, async (req, res) => {
        logger.info(`> ${req.url}, ${JSON.stringify(req.params)}`);
        const queried = await queryBus.execute(
          implementation.handler(req.query as any)
        );
        logger.info(
          `< ${endpointName}`,
          await bridgeSerializer.serialize(queried)
        );
        const serialized = await bridgeSerializer.serialize(queried);
        if (serialized === undefined) {
          return res.status(204).end();
        }
        return res.status(200).send(serialized);
      });
    } else if (implementation.method === "post") {
      app.post(`/${endpointName}`, async (req, res) => {
        logger.info(`> ${req.url}, ${JSON.stringify(req.body)}`);
        const queried = await commandBus.execute(
          implementation.handler(req.body as any)
        );
        logger.info(`< ${endpointName}`);
        const serialized = await bridgeSerializer.serialize(queried);
        if (serialized === undefined) {
          return res.status(204).end();
        }
        return res.status(200).send(serialized);
      });
    }
  });

  app.listen(8080, () => {
    logger.info("Listening over port 8080");
  });
}
