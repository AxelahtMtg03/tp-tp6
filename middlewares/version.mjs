import { APP_VERSION } from "../config.mjs";

/**
 * Middleware qui ajoute un header X-API-version
 * à toutes les réponses.
 */
export default function versionMiddleware(request, response, next) {
  response.setHeader("X-API-version", APP_VERSION);
  return next();
}