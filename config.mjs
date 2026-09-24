import dotenv from "dotenv";
import logger from "loglevel";

dotenv.config();

export const PORT = Number.parseInt(process.env.PORT ?? "8080", 10);
export const LINK_LEN = Number.parseInt(process.env.LINK_LEN ?? "6", 10);
export const DB_FILE = process.env.DB_FILE ?? "database/database.sqlite";
export const DB_SCHEMA = process.env.DB_SCHEMA ?? "database/database.sql";

export const NODE_ENV = process.env.NODE_ENV ?? "development";
export const APP_VERSION = "1.0.0";
// Niveau de log selon l'environnement
logger.setLevel(
  NODE_ENV === "development" ? logger.levels.DEBUG : logger.levels.WARN,
);

export { logger };