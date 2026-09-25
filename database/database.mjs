import Database from "better-sqlite3";
import fs from "node:fs";
import logger from "loglevel";

let db = null;

/**
 * Initialise la base de données : crée le fichier si nécessaire,
 * puis applique le schéma SQL.
 */
export function initDatabase(dbFile, schemaFile) {
  logger.debug(`Initializing database : ${dbFile}`);
  db = new Database(dbFile);

  const schema = fs.readFileSync(schemaFile, "utf8");
  db.exec(schema);

  logger.info(`Database ready : ${dbFile}`);
  return db;
}

/**
 * Récupère la connexion à la base (à utiliser après initDatabase).
 */
export function getDatabase() {
  if (!db) throw new Error("Database not initialized");
  return db;
}

/**
 * Compte le nombre de liens en base.
 */
export function countLinks() {
  const row = getDatabase().prepare("SELECT COUNT(*) AS total FROM links").get();
  return row.total;
}

/**
 * Insère un nouveau lien et renvoie ses informations.
 */
export function createLink(url, short, secret) {
  const info = getDatabase()
    .prepare("INSERT INTO links (url, short, secret) VALUES (?, ?, ?)")
    .run(url, short, secret);

  return getLinkById(info.lastInsertRowid);
}

/**
 * Supprime un lien par son code court.
 */
export function deleteLink(short) {
  return getDatabase().prepare("DELETE FROM links WHERE short = ?").run(short);
}

/**
 * Renvoie un lien par son id.
 */
export function getLinkById(id) {
  return getDatabase().prepare("SELECT * FROM links WHERE id = ?").get(id);
}

/**
 * Renvoie un lien par son code court.
 */
export function getLinkByShort(short) {
  return getDatabase().prepare("SELECT * FROM links WHERE short = ?").get(short);
}

/**
 * Renvoie un lien par son URL d'origine.
 */
export function getLinkByUrl(url) {
  return getDatabase().prepare("SELECT * FROM links WHERE url = ?").get(url);
}

/**
 * Incrémente le compteur de visites d'un lien.
 */
export function incrementVisits(short) {
  getDatabase()
    .prepare("UPDATE links SET visits = visits + 1 WHERE short = ?")
    .run(short);
}

/**
 * Ferme la connexion à la base.
 */
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    logger.debug("Database closed");
  }
}