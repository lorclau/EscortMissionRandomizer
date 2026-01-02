const roles = [
  "Tank",
  "Healer",
  "DPS",
  "Support",
  "Sniper",
  "Scout",
  "Bruiser",
  "Controller",
  "Engineer",
  "Flex"
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

// Enable dropping on columns
document.querySelectorAll(".column").forEach(column => {
  column.addEventListener("dragover", e => e.preventDefault());
  column.addEventListener("drop", dropTag);
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
    <span class="name">${name}</span>
    <span class="role"></span>
    <span class="delete">✖</span>
  `;

  tag.addEventListener("dragstart", () => draggedTag = tag);

  tag.querySelector(".delete").addEventListener("click", () => {
    tag.remove();
  });

  document.getElementById("participants").appendChild(tag);

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
  const team = document.getElementById(teamId);
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
  const team = document.getElementById(teamId);
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
    document.getElementById("participants").querySelectorAll(".tag")
  );

  if (participants.length === 0) return;

  shuffleArray(participants);

  const attackers = document.getElementById("attackers");
  const defenders = document.getElementById("defenders");

  participants.forEach((player, index) => {
    if (index % 2 === 0) {
      attackers.appendChild(player);
    } else {
      defenders.appendChild(player);
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
  const attackers = document.getElementById("attackers");
  const defenders = document.getElementById("defenders");

  const attackerPlayers = Array.from(attackers.querySelectorAll(".tag"));
  const defenderPlayers = Array.from(defenders.querySelectorAll(".tag"));

  attackerPlayers.forEach(player => defenders.appendChild(player));
  defenderPlayers.forEach(player => attackers.appendChild(player));
}

