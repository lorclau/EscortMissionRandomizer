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

//categories (can add specifics later like ranged dps)
const roleCategories = {
  "Deadeye": "DPS",
  "Taylor": "DPS",
  "Forge": "DPS",
  "Aeroblade": "DPS",
  "Ravage": "DPS",
  "Scorcher": "DPS",
  "Guardian": "Tank",
  "Rimefist": "Tank",
  "Flamefist": "Tank",
  "Gaia": "Tank",
  "Luminra": "Healer",
  "Reso": "Healer",
  "Sylora": "Healer",
  "Razorstrike": "Assassin",
  "Vaporix": "Assassin"
};

const input = document.getElementById("playerInput");
const addBtn = document.getElementById("addPlayerBtn");
const assignBtn = document.getElementById("assignRolesBtn");
const copyBtn = document.getElementById("copyBtn");
const randomizeBtn = document.getElementById("randomizeTeamsBtn");
const swapBtn = document.getElementById("swapTeamsBtn");
const remixBtn = document.getElementById("remixTeamsBtn");

let draggedTag = null;

/* -------------------------
   EVENT LISTENERS
-------------------------- */

// Remix teams, randomizes players already assigned to teams (not participants)
remixBtn.addEventListener("click", remixTeams);

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
  const team = document.getElementById(teamId + "Drop");
  const players = Array.from(team.querySelectorAll(".tag"));

  const categoryOnly = document.getElementById("categoryOnlyCheckbox").checked;
  const noDoubleHealer = document.getElementById("noDoubleHealerCheckbox").checked;

  if (categoryOnly) {
  const pools = getCategoryPools(); // max available per category
  const assignedCounts = {}; // how many assigned per team

  Object.keys(pools).forEach(cat => assignedCounts[cat] = 0);

  players.forEach(player => {
    let availableCategories = Object.keys(pools).filter(cat => assignedCounts[cat] < pools[cat]);

    if (noDoubleHealer) {
      // remove Healer if already assigned
      if (assignedCounts["Healer"] > 0) {
        availableCategories = availableCategories.filter(cat => cat !== "Healer");
      }
    }

    if (availableCategories.length === 0) {
      // fallback if all exhausted
      availableCategories = Object.keys(pools);
    }

    const index = Math.floor(Math.random() * availableCategories.length);
    const assignedCategory = availableCategories[index];

    assignedCounts[assignedCategory]++;
    player.querySelector(".role").textContent = `(${assignedCategory})`;
  });
  
} else {
    // Original role assignment
    let availableRoles = [...Object.keys(roleCategories)];

    if (noDoubleHealer) {
      // Remove extra healers after first assigned
      let healerAssigned = false;
      players.forEach(player => {
        if (availableRoles.length === 0) return;

        let index = Math.floor(Math.random() * availableRoles.length);
        let role = availableRoles[index];

        // If healer already assigned, skip any other healer
        if (roleCategories[role] === "Healer" && healerAssigned) {
          // find first non-healer role
          const nonHealerIndex = availableRoles.findIndex(r => roleCategories[r] !== "Healer");
          if (nonHealerIndex !== -1) {
            index = nonHealerIndex;
            role = availableRoles[index];
          }
        }

        if (roleCategories[role] === "Healer") healerAssigned = true;

        availableRoles.splice(index, 1); // remove assigned role
        player.querySelector(".role").textContent = `(${role})`;
      });
    } else {
      players.forEach(player => {
        if (availableRoles.length === 0) return;
        const index = Math.floor(Math.random() * availableRoles.length);
        const role = availableRoles.splice(index, 1)[0];
        player.querySelector(".role").textContent = `(${role})`;
      });
    }
  }
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
  const team = document.getElementById(teamId + "Drop");
  const players = Array.from(team.querySelectorAll(".tag"));
  const categoryOnly = document.getElementById("categoryOnlyCheckbox").checked;

  const formatted = players.map(player => {
    const name = player.querySelector(".name")?.textContent ?? "";
    let roleText = player.querySelector(".role")?.textContent ?? "";
    roleText = roleText.replace(/[()]/g, ""); // remove parentheses

    if (categoryOnly) {
      // Use category only
      roleText = roleText.toLowerCase() || "none";
    } else {
      // Keep the actual role name, not category
      roleText = roleText || "none";
    }

    return `${name} - ${roleText}`;
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

function remixTeams() {
  const attackersDrop = document.getElementById("attackersDrop");
  const defendersDrop = document.getElementById("defendersDrop");

  // Collect all players currently in attackers and defenders
  const allPlayers = [
    ...Array.from(attackersDrop.querySelectorAll(".tag")),
    ...Array.from(defendersDrop.querySelectorAll(".tag"))
  ];

  if (allPlayers.length === 0) return;

  // Shuffle them
  shuffleArray(allPlayers);

  // Clear current drop zones
  attackersDrop.innerHTML = "";
  defendersDrop.innerHTML = "";

  // Reassign alternately to attackers and defenders
  allPlayers.forEach((player, index) => {
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

// function to get the number of roles in each category, that way it can't assign 3 tanks to a team if there are only 2 total in-game
function getCategoryPools() {
  // Count how many roles exist per category
  const pools = {};
  Object.values(roleCategories).forEach(cat => {
    if (!pools[cat]) pools[cat] = 0;
    pools[cat]++;
  });
  return pools; // e.g., { DPS: 6, Tank: 4, Healer: 3, Assassin: 2 }
}

