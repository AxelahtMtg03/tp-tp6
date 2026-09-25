import express from "express";
import createError from "http-errors";
import { LINK_LEN } from "../config.mjs";
import {
  countLinks,
  createLink,
  getLinkByUrl,
  getLinkByShort,
  incrementVisits,
  deleteLink,
} from "../database/database.mjs";

const router = express.Router();

function generateShortCode(length = LINK_LEN) {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

function generateSecret(length = LINK_LEN) {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < length; i++) {
    s += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return s;
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function buildShortUrl(request, short) {
  return `${request.protocol}://${request.get("host")}/${short}`;
}

/**
 * GET / — nombre de liens (JSON) ou page d'accueil (HTML).
 */
router.get("/", async (request, response, next) => {
  try {
    const total = countLinks();
    return response.format({
      json: () => response.json({ count: total }),
      html: () => response.render("root", { count: total, link: null }),
      default: () => next(createError(406, "Not Acceptable")),
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST / — crée un lien (JSON) ou page avec lien créé (HTML).
 */
router.post("/", async (request, response, next) => {
  try {
    const { url } = request.body;

    if (!url) return next(createError(400, "Missing 'url' field"));
    if (!isValidUrl(url)) return next(createError(400, "Invalid URL"));

    let link = getLinkByUrl(url);

    if (!link) {
      let short;
      do {
        short = generateShortCode();
      } while (getLinkByShort(short));
      const secret = generateSecret();
      link = createLink(url, short, secret);
    }

    const shortUrl = buildShortUrl(request, link.short);

    return response.format({
      json: () => response.status(201).json({ ...link, shortUrl }),
      html: () =>
        response.render("root", {
          count: countLinks(),
          link: { ...link, shortUrl },
        }),
      default: () => next(createError(406, "Not Acceptable")),
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * DELETE /:url — supprime un lien.
 * Protégé par un secret passé dans l'en-tête X-API-Key.
 */
router.delete("/:url", async (request, response, next) => {
  try {
    const link = getLinkByShort(request.params.url);
    if (!link) return next(createError(404, "Link not found"));

    const apiKey = request.get("X-API-Key");
    if (!apiKey) return next(createError(401, "Missing X-API-Key header"));
    if (apiKey !== link.secret) return next(createError(403, "Invalid X-API-Key"));

    deleteLink(link.short);
    return response
      .status(200)
      .json({ message: "Link deleted", short: link.short });
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /:url — JSON : infos du lien. HTML : incrémente et redirige.
 * ⚠️ Doit être en dernier (route générique).
 */
router.get("/:url", async (request, response, next) => {
  try {
    const link = getLinkByShort(request.params.url);
    if (!link) return next(createError(404, "Link not found"));

    return response.format({
      json: () => {
        const { secret, ...publicLink } = link;
        return response.json(publicLink);
      },
      html: () => {
        incrementVisits(link.short);
        return response.redirect(link.url);
      },
      default: () => next(createError(406, "Not Acceptable")),
    });
  } catch (error) {
    return next(error);
  }
});

export default router;