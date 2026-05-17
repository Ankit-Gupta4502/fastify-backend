import { fileURLToPath } from "node:url";

export const backendEnvPath = fileURLToPath(
  new URL("../../../../.env", import.meta.url),
);
