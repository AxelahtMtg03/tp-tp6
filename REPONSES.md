# TP6 — Réponses aux questions

## Partie 1 : prise en main

### 1. Commande httpie correspondant à la commande curl pour POST

```
http POST http://localhost:8080/api-v1/ url="https://perdu.com"
```

### 2. Différences entre npm run prod et npm run dev

```
npm run dev : lance avec NODE_ENV=development + nodemon. Morgan log toutes les requêtes et le niveau de log est DEBUG.

npm run prod : lance avec NODE_ENV=production + node classique. Morgan est désactivé et le niveau de log passe à WARN.
```

### 3. Script npm qui formate automatiquement tous les fichiers .mjs

```
"format": "prettier --write \"**/*.mjs\""
```

Utilisation : `npm run format`

### 4. Configuration Express pour retirer X-Powered-By

```
app.disable("x-powered-by");
```

À placer juste après `const app = express();`.

### 5. Middleware qui ajoute X-API-version

Fichier `middlewares/version.mjs` :

```
import { APP_VERSION } from "../config.mjs";

export default function versionMiddleware(request, response, next) {
  response.setHeader("X-API-version", APP_VERSION);
  return next();
}
```

Dans `server.mjs` :

```
import versionMiddleware from "./middlewares/version.mjs";
app.use(versionMiddleware);
```

### 6. Middleware favicon

On utilise le paquet `serve-favicon` :

```
import favicon from "serve-favicon";
app.use(favicon("static/logo_univ_16.png"));
```

### 7. Documentation du driver SQLite utilisé

```
Driver utilisé : better-sqlite3

npm : https://www.npmjs.com/package/better-sqlite3
GitHub : https://github.com/WiseLibs/better-sqlite3
API : https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md
```

### 8. Moments d'ouverture / fermeture de la connexion BDD

```
Ouverture : au démarrage de l'application, dans initDatabase() (appelé en haut de server.mjs). La connexion reste ouverte pendant toute la durée de vie de l'application.

Fermeture : quand le processus reçoit SIGINT (Ctrl+C), le handler appelle closeDatabase() qui ferme proprement la connexion SQLite.
```

### 9. Gestion du cache par Express

```
En visitant http://localhost:8080/ deux fois puis Ctrl+Shift+R :

1ère visite : 200 OK — Express renvoie la page complète.
2ème visite : 304 Not Modified (ou 200 si cache désactivé) — Express ajoute un header ETag et Last-Modified. Le navigateur envoie ces valeurs au serveur, qui répond 304 si la ressource n'a pas changé.
Ctrl+Shift+R : 200 OK — le navigateur ignore le cache et demande la version fraîche.

Conclusion : Express gère automatiquement le cache HTTP grâce aux headers ETag, Last-Modified et Cache-Control.
```

### 10. Deux instances sur ports 8080 et 8081

```
Les liens de l'une sont visibles depuis l'autre car les deux instances partagent la même base SQLite (database/database.sqlite). Le fichier étant sur le disque, les deux processus lisent et écrivent dedans. Ce n'est PAS un cache mémoire : c'est bien une base de données persistante commune.

Attention : en production, avoir deux processus qui écrivent en même temps dans la même base SQLite peut poser problème (verrous). Mais pour du dev/test, ça fonctionne.
```