document.addEventListener("DOMContentLoaded", () => {
 const matchesContainer = document.getElementById("matches-container");

 const userToken = localStorage.getItem("userToken") || generateToken();
 localStorage.setItem("userToken", userToken);

 // Charger les matchs
 fetch("/matches")
   .then(response => response.json())
   .then(data => renderMatches(data));

   function renderMatches(matches) {
    matchesContainer.innerHTML = "";
  
    matches.forEach((match, index) => {
      const card = document.createElement("div");
      card.className = "card";
  
      card.innerHTML = `
        <h3>${match.category} - ${match.home_team} vs ${match.away_team}</h3>
        <p><strong>Date:</strong> ${match.date}</p>
        <p><strong>Heure:</strong> ${match.time}</p>
        <p><strong>Lieu:</strong> ${match.location}</p>
        <div class="status">
          <p>e-Marque: ${match.scorekeeper?.name || "Disponible"}</p>
          <p>Chronomètre: ${match.timer?.name || "Disponible"}</p>
          <p>Arbitre 1: ${match.referee1?.name || "Disponible"}</p>
          <p>Arbitre 2: ${match.referee2?.name || "Disponible"}</p>
        </div>
        <div class="buttons">
          ${renderButton(match.scorekeeper, "scorekeeper", index)}
          ${renderButton(match.timer, "timer", index)}
          ${renderButton(match.referee1, "referee1", index)}
          ${renderButton(match.referee2, "referee2", index)}
        </div>
      `;
  
      matchesContainer.appendChild(card);
    });
  
    addEventListeners(matches);
  }
  
  function renderButton(role, type, index) {
    if (role && role.token === userToken) {
      // Si l'utilisateur actuel est déjà inscrit, afficher "Se désinscrire"
      return `<button data-action="remove" data-type="${type}" data-index="${index}">Se désinscrire (${type === "scorekeeper" ? "Marque" : type === "timer" ? "Chronomètre" : type === "referee1" ? "Arbitre 1" : type === "referee2" ? "Arbitre 2" : type})</button>`;
    } else if (!role) {
      // Si le rôle est disponible, afficher "S'inscrire"
      return `<button data-action="add" data-type="${type}" data-index="${index}">S'inscrire (${type === "scorekeeper" ? "Marque" : type === "timer" ? "Chronomètre" : type === "referee1" ? "Arbitre 1" : type === "referee2" ? "Arbitre 2" : type})</button>`;
    } else {
      // Si le rôle est pris par quelqu'un d'autre
      return `<button disabled>${type === "scorekeeper" ? "Marque" : type === "timer" ? "Chronomètre" : type === "referee1" ? "Arbitre 1" : type === "referee2" ? "Arbitre 2" : type} déjà pris</button>`;
    }
  }
  

 function addEventListeners(matches) {
   document.querySelectorAll("button[data-action]").forEach(button => {
     button.addEventListener("click", (e) => {
       const action = e.target.getAttribute("data-action");
       const type = e.target.getAttribute("data-type");
       const index = e.target.getAttribute("data-index");

       if (action === "add") {
         const name = prompt("Votre nom :");

         if (name) {
           // Ajouter l'utilisateur au rôle
           updateMatch(index, type, name, userToken);
         }
       } else if (action === "remove") {
         // Supprimer l'utilisateur du rôle
         updateMatch(index, type, null, userToken);
       }
     });
   });
 }

 function updateMatch(index, type, name, token) {
   fetch("/update-match", {
     method: "POST",
     headers: {
       "Content-Type": "application/json"
     },
     body: JSON.stringify({ index, type, name, token })
   })
     .then(response => {
       if (!response.ok) {
         return response.text().then(text => { throw new Error(text); });
       }
       return response.json();
     })
     .then(updatedMatch => {
       // Recharger les matchs après la mise à jour
       fetch("/matches")
         .then(response => response.json())
         .then(data => renderMatches(data));
     })
     .catch(error => {
       alert("Erreur : " + error.message);
       console.error("Erreur :", error);
     });
 }

 function generateToken() {
   return 'xxxx-xxxx-xxxx'.replace(/x/g, () => Math.floor(Math.random() * 16).toString(16));
 }
});
