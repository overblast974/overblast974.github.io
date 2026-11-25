# Site coachapar.fr : mode d'emploi

Le site est fabriqué à partir des pages HTML et d'un seul fichier de données, `_data/entreprise.yaml` : téléphone, e-mail, horaires, zone, prix, phrase d'absence, mentions, questions fréquentes. L'outil qui fabrique le site s'appelle Eleventy. Il ne sert qu'à la fabrication : le visiteur ne reçoit rien de plus qu'aujourd'hui.

> **État au 25/11/2026, branche `refonte/site` (lot F).** Sur cette branche, les pages de la refonte lisent `_data/entreprise.yaml` : changer un prix, un horaire, le téléphone ou la phrase d'absence dans ce fichier change toutes les pages et les données pour Google. Sur `main`, tant que la bascule (lot E) n'est pas faite, rien de cela ne s'applique encore. Contrôles : `npm test` (fabrication, `_outils/controler.mjs` pour les données, `_outils/verifier-site.mjs` pour les adresses, liens, sécurité et règles de contenu). Simuler le 11 janvier 2027 : `DATE_FABRICATION=2027-01-11 npm run build` puis `node _outils/controler.mjs --date 2027-01-11`.

## Changer un prix (après le lot E)

Exemple : le forfait 10 séances passe à 460 €.

1. Sur github.com, dépôt `overblast974.github.io`, ouvrez `_data/entreprise.yaml`, puis le crayon « Edit this file ».
2. Dans `offre`, `forfaits`, sur le bloc `seances: 10`, remplacez `prix: 450` par `prix: 460`. Un nombre seul, sans « € ».
3. « Commit changes… », cochez « Create a new branch for this commit and start a pull request », puis « Propose changes » et « Create pull request ».
4. Attendez la vérification automatique (1 à 2 minutes).
   - Coche verte : « Merge pull request ». Le site est à jour quelques minutes plus tard : grille des tarifs, CGV article 3.1, prix par séance et remise (calculés, vous ne les écrivez jamais), FAQ et données pour Google.
   - Croix rouge : ouvrez « Details ». Le message donne la ligne fautive (par exemple « offre.forfaits[2].prix : un prix est un nombre entier d'euros »). Rien n'est publié, le site en ligne ne bouge pas.

Plus simple : demandez-le à votre agent (« passe le forfait 10 séances à 460 € »). Il fait la même modification et ouvre la demande de fusion : vous n'avez plus qu'à fusionner.

## Changer un horaire (après le lot E)

Même geste, dans `horaires`, `plages`. Exemple : finir à 21 h au lieu de 21 h 30 en semaine : `a: "21:30"` devient `a: "21:00"`. Les heures s'écrivent `"HH:MM"`, entre guillemets. Les jours s'écrivent en toutes lettres et doivent se suivre ; pour des jours séparés, ajoutez une plage.

## La phrase d'absence

`absence`, `reprise_le: "2027-01-11"` : la phrase s'affiche jusqu'à la veille de cette date et disparaît d'elle-même, grâce à une fabrication automatique chaque nuit. Pour une absence future, remettez une date et une phrase. Si la fabrication de nuit s'est arrêtée (GitHub la suspend après 60 jours sans activité sur le dépôt), onglet « Actions », « Publier le site », « Run workflow ».

## La bascule (lot E) : l'ordre exact

Rien ne se fait avant le feu vert de la régie. Chaque étape attend que la précédente soit vérifiée. **L'ordre compte : on change la source d'abord, on fusionne ensuite.** Dans l'ordre inverse, Jekyll publierait les gabarits bruts et le site serait cassé en ligne.

| # | Qui | Quoi | Ce qui se passe |
|---|---|---|---|
| 1 | Vous | Settings, Pages : faites une capture de l'écran. Il doit montrer « Deploy from a branch », `main`, `/ (root)`, le domaine `coachapar.fr` et « Enforce HTTPS » coché. | Rien. C'est la photo « avant ». |
| 2 | Vous | Créez la branche de secours `secours/ancien-site` à partir de `main` (page d'accueil du dépôt, menu des branches, tapez le nom, « Create branch »). | Rien. C'est l'ancien site, gardé pour revenir en arrière. |
| 3 | Vous | Settings, Pages, « Build and deployment », « Source » : choisissez **GitHub Actions**. **N'acceptez aucun des modèles que GitHub propose** (Jekyll, Static HTML…) : le flux est déjà dans le dépôt. | Plus rien n'est publié par Jekyll. L'ancien site reste en ligne tel quel. |
| 4 | Agence | Vérifie que l'ancien site est toujours servi et que le domaine `coachapar.fr` est toujours réglé. | Feu vert pour la fusion. |
| 5 | Vous | Fusionnez la demande de fusion de la refonte, que la régie vous envoie. | « Publier le site » se lance seul dans l'onglet « Actions ». Coche verte en 1 à 3 minutes : la refonte est en ligne. |
| 6 | Vous | Settings, Pages : vérifiez que le domaine `coachapar.fr` est toujours là, avec la vérification DNS réussie et « Enforce HTTPS » coché. S'il a disparu, retapez `coachapar.fr` et « Save ». | Avec GitHub Actions, le fichier `CNAME` du dépôt n'est plus lu : seul ce réglage compte. |
| 7 | Agence | Contrôle en production : les 14 pages, le plan du site, la page 404, HTTPS. | Bascule terminée. À partir de là, `_data/entreprise.yaml` pilote le site. |

**Revenir en arrière** (moins de cinq minutes) : Settings, Pages, « Source » : « Deploy from a branch », branche **`secours/ancien-site`**, `/ (root)`, « Save ». L'ancien site revient. **Ne choisissez jamais `main` en mode branche après la fusion** : `main` contient alors des gabarits que Jekyll ne sait pas lire.

## Voir le site avant de publier (facultatif)

Sur votre PC, dans le dossier du dépôt : `npm ci`, puis `npm run serve`, puis ouvrez l'adresse indiquée (http://localhost:8080). `npm test` fabrique le site et lance tous les contrôles.
