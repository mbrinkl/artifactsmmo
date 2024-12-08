import { DEFAULT_PORT } from "@artifacts/shared";

const { origin, protocol, hostname } = window.location;

export const tokenStorageKey = "artifacts_token";
export const serverUrl =
  (process.env.NODE_ENV === "production" ? origin : `${protocol}//${hostname}:${DEFAULT_PORT}`) + "/api";
