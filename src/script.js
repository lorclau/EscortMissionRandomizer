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

let draggedTag = null;

/* -------------------------
   EVENT LISTENERS
-------------------------- */

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
    const role = roleText.replace(/[()]/g, "").toLowerCase() || "no-role";
    return `${name} - ${role}`;
  });

  return `${label}: ${formatted.join(", ")}`;
}
