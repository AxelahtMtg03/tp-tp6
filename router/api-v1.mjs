import express from "express";
import createError from "http-errors";
import { LINK_LEN, logger } from "../config.mjs";
import {
  countLinks,
  createLink,
  getLinkByUrl,
  getLinkByShort,
} from "../database/database.mjs";

const router = express.Router();

/**
 * Génère un identifiant court aléatoire de LINK_LEN caractères.
 */
function generateShortCode(length = LINK_LEN) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

/**
 * Valide une URL avec l'API URL standard.
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * GET / — nombre de liens en base.
 */
router.get("/", async (request, response) => {
  const total = countLinks();
  return response.json({ count: total });
});

/**
 * POST / — crée un nouveau lien réduit.
 */
router.post("/", async (request, response, next) => {
  try {
    const { url } = request.body;

    if (!url) return next(createError(400, "Missing 'url' field"));
    if (!isValidUrl(url)) return next(createError(400, "Invalid URL"));

    // Si l'URL existe déjà, on renvoie le lien existant
    const existing = getLinkByUrl(url);
    if (existing) {
      return response.status(200).json(existing);
    }

    // Génère un code court unique
    let short;
    do {
      short = generateShortCode();
    } while (getLinkByShort(short));

    const link = createLink(url, short);
    return response.status(201).json(link);
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /error — route de test qui renvoie une erreur 500.
 */
router.get("/error", async () => {
  throw new Error("Test error 500");
});

export default router;