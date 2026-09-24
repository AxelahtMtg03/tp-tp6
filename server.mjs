import express from "express";
import morgan from "morgan";
import createError from "http-errors";
import fs from "node:fs";
import YAML from "yaml";
import swaggerUi from "swagger-ui-express";
import versionMiddleware from "./middlewares/version.mjs";
import { PORT, NODE_ENV, DB_FILE, DB_SCHEMA, logger } from "./config.mjs";
import { initDatabase, closeDatabase } from "./database/database.mjs";
import apiV1 from "./router/api-v1.mjs";
import favicon from "serve-favicon";
import apiV2 from "./router/api-v2.mjs";
// 1. Initialise la BDD
initDatabase(DB_FILE, DB_SCHEMA);

// 2. Crée l'app Express
const app = express();
app.set("view engine", "ejs");
app.set("views", "views");
app.disable("x-powered-by");
// 3. Middlewares généraux
if (NODE_ENV === "development") app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(versionMiddleware);
app.use(favicon("static/logo_univ_16.jpg"));

// 4. Swagger UI (APRÈS app)
const openApiDoc = YAML.parse(fs.readFileSync("static/open-api.yaml", "utf8"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDoc));

// 5. Routes API v1
app.use("/api-v1", apiV1);
app.use("/api-v2", apiV2);
app.use("/", apiV2);

// 6. 404 par défaut
app.use((request, response, next) => {
  return next(createError(404));
});

// 7. Gestionnaire d'erreurs
app.use((error, _request, response, _next) => {
  const status = error.status ?? 500;
  const message = error.message ?? "Internal Server Error";
  return response.status(status).json({ code: status, message });
});

// 8. Démarre le serveur
const server = app.listen(PORT, () => {
  logger.info(
    `HTTP listening on http://localhost:${server.address().port} with mode '${NODE_ENV}'`,
  );
});

// 9. Ferme proprement la BDD à l'arrêt
process.on("SIGINT", () => {
  closeDatabase();
  process.exit(0);
});