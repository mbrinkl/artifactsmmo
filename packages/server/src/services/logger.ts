import pino from "pino";
import { LokiOptions } from "pino-loki";
import { PrettyOptions } from "pino-pretty";

export const initializeLogger = () => {
  const lokiHost = process.env.loki_host;
  const lokiUser = process.env.loki_user;
  const lokiToken = process.env.loki_token;

  if (!lokiUser || !lokiToken || !lokiHost) {
    throw new Error("Grafana Loki environment variables not set");
  }

  const stdOutTransport: pino.TransportSingleOptions<PrettyOptions> = {
    target: "pino-pretty",
    options: { destination: 1, ignore: "pid,hostname" },
  };

  const lokiTransport: pino.TransportSingleOptions<LokiOptions> = {
    target: "pino-loki",
    options: {
      batching: true,
      interval: 5,
      host: lokiHost,
      basicAuth: {
        username: lokiUser,
        password: lokiToken,
      },
      labels: {
        service_name: "artifacts",
      },
    },
  };

  const transport =
    process.env.NODE_ENV === "development"
      ? pino.transport(stdOutTransport)
      : pino.transport<PrettyOptions | LokiOptions>({ targets: [stdOutTransport, lokiTransport] });

  return pino(transport);
};
