const data = {
  salles: [
    {
      ref: "SALLE FORMATION A",
      capacite: 20,
      image: "images/salle1.png"
    },
    {
      ref: "SALLE REUNION B",
      capacite: 10,
      image: "images/salle2.png"
    },
    {
      ref: "AMPHI C",
      capacite: 80,
      image: "images/salle3.png"
    },
    {
      ref: "LAB INFORMATIQUE",
      capacite: 25,
      image: "images/salle4.png"
    }
  ]
};

let reservations = [];
let compteurReservations = 1;


// Remplir la liste des salles
function remplirSalles() {
  const select = document.getElementById("salleSelect");

  select.innerHTML = '<option value="">-- Choisir une salle --</option>';

  data.salles.forEach(function(salle, index) {
    const option = document.createElement("option");

    option.value = index;
    option.textContent =
      salle.ref + " - " + salle.capacite + " places";

    select.appendChild(option);
  });
}


// Afficher les erreurs
function afficherErreur(message) {
  const messageErreur = document.getElementById("messageErreur");

  messageErreur.textContent = message;
  messageErreur.style.display = "block";
}


// Valider le formulaire
function validerChamps() {
  const salleIndex = document.getElementById("salleSelect").value;
  const nombreHeures = document.getElementById("nombreHeures").value;
  const dateReservation = document.getElementById("dateReservation").value;
  const messageErreur = document.getElementById("messageErreur");

  messageErreur.textContent = "";
  messageErreur.style.display = "none";

  if (salleIndex === "") {
    afficherErreur("Vous devez choisir une salle.");
    return false;
  }

  if (
    nombreHeures === "" ||
    Number(nombreHeures) < 1 ||
    Number(nombreHeures) > 8
  ) {
    afficherErreur("Le nombre d'heures doit être entre 1 et 8.");
    return false;
  }

  if (dateReservation === "") {
    afficherErreur("La date de réservation est obligatoire.");
    return false;
  }

  const dateChoisie = new Date(dateReservation + "T00:00:00");
  const aujourdHui = new Date();

  aujourdHui.setHours(0, 0, 0, 0);

  if (dateChoisie < aujourdHui) {
    afficherErreur("Vous ne pouvez pas réserver une salle dans le passé.");
    return false;
  }

  const selectedSalle = data.salles[Number(salleIndex)];

  const salleOccupee = reservations.some(function(item) {
    return item.salle === selectedSalle.ref &&
           item.date === dateReservation;
  });

  if (salleOccupee) {
    afficherErreur(
      "Cette salle est déjà réservée pour cette date. " +
      "Veuillez choisir une autre salle ou une autre date."
    );
    return false;
  }

  return true;
}


// Ajouter une réservation
function addReservation() {
  if (!validerChamps()) {
    return;
  }

  const salleIndex =
    Number(document.getElementById("salleSelect").value);

  const nombreHeures =
    Number(document.getElementById("nombreHeures").value);

  const dateReservation =
    document.getElementById("dateReservation").value;

  const selectedSalle = data.salles[salleIndex];

  const nouvelleReservation = {
    numero: "RES-" + String(compteurReservations).padStart(3, "0"),
    salle: selectedSalle.ref,
    capacite: selectedSalle.capacite,
    image: selectedSalle.image,
    date: dateReservation,
    heures: nombreHeures
  };

  compteurReservations++;

  reservations.push(nouvelleReservation);

  afficherReservations();
  afficherStatistiques();
  afficherConfirmation(nouvelleReservation);

  viderFormulaire();
}


// Afficher toutes les réservations
function afficherReservations() {
  const tbody = document.getElementById("reservationBody");
  const filter = document.getElementById("capacityFilter").value;

  tbody.innerHTML = "";

  reservations.forEach(function(item, index) {
    if (!respecteFiltreCapacite(item, filter)) {
      return;
    }

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td><strong>${item.salle}</strong></td>
      <td>${item.date}</td>
      <td class="heures-cell">${item.heures} heure(s)</td>
      <td>${item.capacite} places</td>
      <td>
        <img
          src="${item.image}"
          alt="${item.salle}"
          class="salle-img"
          onerror="this.style.display='none'"
        >
      </td>
      <td>
        <button
          class="outline-btn"
          onclick="afficherConfirmation(reservations[${index}])"
        >
          Confirmation
        </button>

        <button
          class="delete-btn"
          onclick="deleteReservation(${index})"
        >
          Supprimer
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}


// Supprimer une réservation
function deleteReservation(index) {
  if (confirm("Voulez-vous supprimer cette réservation ?")) {
    reservations.splice(index, 1);

    afficherReservations();
    afficherStatistiques();

    document.getElementById("confirmation").classList.add("hidden");
  }
}


// Filtrer les réservations par capacité
function respecteFiltreCapacite(item, filter) {
  if (filter === "less20") {
    return item.capacite < 20;
  }

  if (filter === "more20") {
    return item.capacite >= 20;
  }

  if (filter === "more50") {
    return item.capacite >= 50;
  }

  return true;
}


// Afficher ou masquer le tableau
function toggleTable() {
  const wrapper = document.getElementById("tableWrapper");

  wrapper.classList.toggle("hidden");
}


// Vider le formulaire
function viderFormulaire() {
  document.getElementById("salleSelect").value = "";
  document.getElementById("nombreHeures").value = "";
  document.getElementById("dateReservation").value = "";
}


// Mettre à jour les statistiques
function afficherStatistiques() {
  document.getElementById("totalReservations").textContent =
    reservations.length;

  const dateChoisie =
    document.getElementById("dateReservation").value;

  let sallesReservees;

  if (dateChoisie !== "") {
    sallesReservees = new Set(
      reservations
        .filter(function(item) {
          return item.date === dateChoisie;
        })
        .map(function(item) {
          return item.salle;
        })
    );
  } else {
    sallesReservees = new Set(
      reservations.map(function(item) {
        return item.salle;
      })
    );
  }

  document.getElementById("sallesDisponibles").textContent =
    data.salles.length - sallesReservees.size;
}


// Afficher la confirmation d'une réservation précise
function afficherConfirmation(item) {
  if (!item) {
    return;
  }

  document.getElementById("confirmationNumero").textContent =
    item.numero;

  document.getElementById("confirmationSalle").textContent =
    item.salle;

  document.getElementById("confirmationDate").textContent =
    item.date;

  document.getElementById("confirmationCapacite").textContent =
    item.capacite + " places";

  document.getElementById("confirmation").classList.remove("hidden");

  document.getElementById("confirmation").scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}


// Mode clair / mode sombre
function toggleTheme() {
  document.body.classList.toggle("dark-mode");

  const button = document.getElementById("themeToggle");

  if (document.body.classList.contains("dark-mode")) {
    button.textContent = "🌙 Mode sombre";
  } else {
    button.textContent = "☀️ Mode clair";
  }
}


// Initialisation de la page
window.onload = function() {
  remplirSalles();
  afficherReservations();
  afficherStatistiques();

  document.getElementById("dateReservation").addEventListener(
    "change",
    afficherStatistiques
  );
};