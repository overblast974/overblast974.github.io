# Site coachapar.fr : mode d'emploi

Le site est fabriqué à partir des pages HTML et d'un seul fichier de données, `_data/entreprise.yaml` : téléphone, e-mail, horaires, zone, prix, phrase d'absence, mentions, questions fréquentes. L'outil qui fabrique le site s'appelle Eleventy. Il ne sert qu'à la fabrication : le visiteur ne reçoit rien de plus qu'aujourd'hui.

> **Attention, état au 25/11/2026.** Le fichier de données existe et décrit exactement le site en ligne, mais **les pages ne le lisent pas encore**. Elles seront branchées dessus au lot E, après la bascule décrite plus bas. D'ici là, modifier `_data/entreprise.yaml` ne change pas le site : une modification se fait dans les pages, comme aujourd'hui, ou en le demandant à votre agent. Le contrôle automatique vous signale tout écart entre les pages et le fichier.

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

Rien ne se fait avant le feu vert de la régie, et pas avant que le lot « Reprise » soit en ligne. Chaque étape attend que la précédente soit vérifiée.

| # | Qui | Quoi | Ce qui se passe |
|---|---|---|---|
| 0 | Agence (backend) | Remet la branche `refonte/outil` à jour sur `main`, relance la vérification. | Coche verte : le site fabriqué est identique, octet pour octet, au site en ligne. |
| 1 | Vous | Settings, Pages : faites une capture de l'écran. Il doit montrer « Deploy from a branch », `main`, `/ (root)`, le domaine `coachapar.fr` et « Enforce HTTPS » coché. | Rien. C'est la photo « avant », pour revenir en arrière. |
| 2 | Vous | Fusionnez la demande de fusion « Outil Eleventy, étape 1 », que la régie vous envoie. | Jekyll republie **le même site**. Dans « Actions », « Publier le site » affiche « Publication sautée » : c'est normal, la source n'a pas encore changé. |
| 3 | Agence (mise en ligne) | Vérifie que le site en ligne n'a pas bougé. | Feu vert pour l'étape 4. |
| 4 | Vous | Settings, Pages, « Build and deployment », « Source » : choisissez **GitHub Actions**. **N'acceptez aucun des modèles que GitHub propose** (Jekyll, Static HTML…) : le flux est déjà dans le dépôt. | Plus rien n'est publié par Jekyll. Le site reste en ligne tel quel. |
| 5 | Vous | Onglet « Actions », « Publier le site », « Run workflow », branche `main`, « Run workflow ». Attendez la coche verte (1 à 3 minutes). | Le site fabriqué par Eleventy est publié. Il est identique au précédent. |
| 6 | Vous | Settings, Pages : vérifiez que le domaine `coachapar.fr` est toujours là, avec la vérification DNS réussie et « Enforce HTTPS » coché. S'il a disparu, retapez `coachapar.fr` et « Save ». | Avec GitHub Actions, le fichier `CNAME` du dépôt n'est plus lu : seul ce réglage compte. |
| 7 | Agence (mise en ligne, recette) | Contrôle en production : les 13 pages, le plan du site, la page 404, HTTPS. | Bascule terminée. |
| 8 | Agence, puis vous | Branchement des pages sur les données (étape 3), une demande de fusion par thème. Vous fusionnez chacune après la coche verte. | À partir de là, ce fichier pilote le site. |

**Revenir en arrière** (possible jusqu'à l'étape 8 exclue) : Settings, Pages, « Source » : « Deploy from a branch », `main`, `/ (root)`, « Save ». Jekyll republie le site comme avant. Après l'étape 8, il faut d'abord annuler les fusions de l'étape 3 : demandez-le à l'agence.

**Ce qu'il ne faut pas faire** : fusionner une page qui contient des balises `{% … %}` ou `{{ … }}` tant que la source est « Deploy from a branch ». Jekyll publierait ces balises telles quelles et la page serait cassée en ligne. La vérification automatique refuse ce cas.

## Voir le site avant de publier (facultatif)

Sur votre PC, dans le dossier du dépôt : `npm ci`, puis `npm run serve`, puis ouvrez l'adresse indiquée (http://localhost:8080). `npm test` fabrique le site et lance tous les contrôles.
