import { FastifyInstance } from "fastify";
import { scenarioFactory } from "../scenarios";
import { CharacterInfo } from "../types";
import { characterInfo } from "..";

export const hooks = (fastify: FastifyInstance) => {
  fastify.addHook("onRequest", (req, res, done) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(400).send(new Error("No Auth Token"));
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(400).send(new Error("Invalid Auth Token Format"));
    }

    const token = authHeader.substring(7, authHeader.length);
    if (token !== process.env.auth_token) {
      return res.status(400).send(new Error("Invalid Auth Token"));
    }

    done();
  });
};

export const routes = (fastify: FastifyInstance) => {
  fastify.get("/dashboard-data", (req, res) => {
    res.send(Object.values(characterInfo));
  });

  fastify.post("/update-activity", (req, res) => {
    const body = JSON.parse(req.body as string) as CharacterInfo;
    scenarioFactory(body);
    characterInfo[body.characterName] = body;
    res.send(body);
  });

  // stop-after-task ?
  // stop-after-queue
};
