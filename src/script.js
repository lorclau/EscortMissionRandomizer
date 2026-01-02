const roles = [
  "Deadeye",
  "Taylor",
  "Forge",
  "Aeroblade",
  "Ravage",
  "Scorcher",
  "Guardian",
  "Rimefist",
  "Flamefist",
  "Gaia",
  "Luminra",
  "Reso",
  "Sylora",
  "Razorstrike",
  "Vaporix"
];

const input = document.getElementById("playerInput");
const addBtn = document.getElementById("addPlayerBtn");
const assignBtn = document.getElementById("assignRolesBtn");
const copyBtn = document.getElementById("copyBtn");
const randomizeBtn = document.getElementById("randomizeTeamsBtn");
const swapBtn = document.getElementById("swapTeamsBtn");

let draggedTag = null;

/* -------------------------
   EVENT LISTENERS
-------------------------- */

// Swap teams, preserves participants list
swapBtn.addEventListener("click", swapTeams);

// Randomize teams
randomizeBtn.addEventListener("click", randomizeTeams);

// Copy names and roles to clipboard
copyBtn.addEventListener("click", copyToClipboard);

// Add player on button click
addBtn.addEventListener("click", addPlayer);

// Add player on Enter key
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addPlayer();
  }
});

// Enable dropping on column dropzones
document.querySelectorAll(".dropzone").forEach(zone => {
  zone.addEventListener("dragover", e => {
    e.preventDefault();
    zone.classList.add("drag-over");
  });

  zone.addEventListener("dragleave", () => {
    zone.classList.remove("drag-over");
  });

  zone.addEventListener("drop", e => {
    e.preventDefault();
    zone.classList.remove("drag-over");
    if (draggedTag) {
      zone.appendChild(draggedTag);

      // Clear role if dropped in participants (optional)
      if (zone.id === "participantsDrop") {
        const roleSpan = draggedTag.querySelector(".role");
        if (roleSpan) roleSpan.textContent = "";
      }

      draggedTag = null;
    }
  });
});

// Assign roles
assignBtn.addEventListener("click", assignRoles);

/* -------------------------
   FUNCTIONS
-------------------------- */

function addPlayer() {
  const name = input.value.trim();
  if (!name) return;

  const tag = document.createElement("div");
  tag.className = "tag";
  tag.draggable = true;

    tag.innerHTML = `
    <span class="drag-handle">
        <span class="name">${name}</span>
        <span class="role"></span>
    </span>
    <span class="delete-box">✖</span>
    `;

  // Append first
  document.getElementById("participantsDrop").appendChild(tag);

  // Drag start, ignore delete box
    tag.addEventListener("dragstart", (e) => {
    if (e.target.closest(".delete-box")) {
        e.preventDefault(); // clicking delete does not start drag
        return;
    }
    draggedTag = tag;
    });

  // Delete listener on the delete-box
    const deleteBox = tag.querySelector(".delete-box");
    deleteBox.addEventListener("click", (e) => {
    e.stopPropagation(); // prevent drag
    tag.remove();
    });

  input.value = "";
  input.focus();
}

function dropTag(e) {
  if (draggedTag) {
    e.currentTarget.appendChild(draggedTag);
    draggedTag = null;
  }
}

function assignRoles() {
  assignTeam("attackers");
  assignTeam("defenders");
}

function assignTeam(teamId) {
  const team = document.getElementById(teamId + "Drop"); // use dropzone
  const players = Array.from(team.querySelectorAll(".tag"));

  let availableRoles = [...roles];

  players.forEach(player => {
    if (availableRoles.length === 0) return;

    const index = Math.floor(Math.random() * availableRoles.length);
    const role = availableRoles.splice(index, 1)[0];

    player.querySelector(".role").textContent = `(${role})`;
  });
}

function copyToClipboard() {
  const attackers = formatTeam("attackers", "A");
  const defenders = formatTeam("defenders", "D");

  const output = `${attackers} | ${defenders}`;

  navigator.clipboard.writeText(output)
    .then(() => {
      alert("Copied to clipboard!");
    })
    .catch(err => {
      console.error("Copy failed:", err);
    });
}

function formatTeam(teamId, label) {
  const team = document.getElementById(teamId + "Drop"); // use dropzone
  const players = Array.from(team.querySelectorAll(".tag"));

  const formatted = players.map(player => {
    const name = player.querySelector(".name")?.textContent ?? "";
    const roleText = player.querySelector(".role")?.textContent ?? "";
    const role = roleText.replace(/[()]/g, "").toLowerCase() || "none";
    return `${name} - ${role}`;
  });

  return `${label}: ${formatted.join(", ")}`;
}

function randomizeTeams() {
  const participants = Array.from(
    document.getElementById("participantsDrop").querySelectorAll(".tag")
  );

  if (participants.length === 0) return;

  shuffleArray(participants);

  const attackersDrop = document.getElementById("attackersDrop");
  const defendersDrop = document.getElementById("defendersDrop");

  participants.forEach((player, index) => {
    if (index % 2 === 0) {
        attackersDrop.appendChild(player);
    } else {
        defendersDrop.appendChild(player);
    }
    });

}

// Fisher–Yates shuffle
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function swapTeams() {
  const attackersDrop = document.getElementById("attackersDrop");
  const defendersDrop = document.getElementById("defendersDrop");

  const attackerPlayers = Array.from(attackersDrop.querySelectorAll(".tag"));
  const defenderPlayers = Array.from(defendersDrop.querySelectorAll(".tag"));

  attackerPlayers.forEach(player => defendersDrop.appendChild(player));
  defenderPlayers.forEach(player => attackersDrop.appendChild(player));
}

