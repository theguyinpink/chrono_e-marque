const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000; // Render définit automatiquement le PORT

// Middleware pour lire les données JSON dans les requêtes POST
app.use(express.json());

// Servir les fichiers statiques depuis le dossier "public"
app.use(express.static(path.join(__dirname, "public")));

// Route pour la page d'accueil
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Route pour lister les fichiers dans le dossier "public" (TEMPORAIRE)
app.get("/files", (req, res) => {
  try {
    const files = fs.readdirSync(path.join(__dirname, "public"));
    res.json(files);
  } catch (err) {
    res.status(500).send("Erreur lors de la lecture des fichiers.");
  }
});

// Route pour récupérer les matchs
app.get("/matches", (req, res) => {
  fs.readFile("matches.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Erreur lors de la lecture des matchs.");
      return;
    }
    res.json(JSON.parse(data));
  });
});

// Route pour mettre à jour un match
app.post("/update-match", (req, res) => {
 const { index, type, name, token } = req.body;

 fs.readFile("matches.json", "utf8", (err, data) => {
   if (err) {
     res.status(500).send("Erreur lors de la lecture des matchs.");
     return;
   }

   const matches = JSON.parse(data);
   const match = matches[index];

   if (!match) {
     res.status(404).send("Match non trouvé.");
     return;
   }

   // Vérifier si le rôle est déjà pris par quelqu'un d'autre
   if (type === "timer" && match.timer && match.timer.token !== token) {
     res.status(403).send("Chronomètre déjà pris.");
     return;
   }
   if (type === "scorekeeper" && match.scorekeeper && match.scorekeeper.token !== token) {
     res.status(403).send("Marque déjà prise.");
     return;
   }
   if (type === "referee1" && match.referee1 && match.referee1.token !== token) {
     res.status(403).send("Arbitre 1 déjà pris.");
     return;
   }
   if (type === "referee2" && match.referee2 && match.referee2.token !== token) {
     res.status(403).send("Arbitre 2 déjà pris.");
     return;
   }

   // Mettre à jour ou supprimer l'inscription
   if (type === "timer") {
     match.timer = match.timer ? null : { name, token };
   } else if (type === "scorekeeper") {
     match.scorekeeper = match.scorekeeper ? null : { name, token };
   } else if (type === "referee1") {
     match.referee1 = match.referee1 ? null : { name, token };
   } else if (type === "referee2") {
     match.referee2 = match.referee2 ? null : { name, token };
   }

   // Écrire les données mises à jour dans le fichier JSON
   fs.writeFile("matches.json", JSON.stringify(matches, null, 2), (err) => {
     if (err) {
       res.status(500).send("Erreur lors de la sauvegarde des matchs.");
       return;
     }
     res.json(match); // Retourner le match mis à jour
   });
 });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
