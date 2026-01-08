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

// Role icons
const roleIcons = {
  "Deadeye": "icons/dps.png",
  "Taylor": "icons/dps.png",
  "Forge": "icons/dps.png",
  "Aeroblade": "icons/dps.png",
  "Ravage": "icons/dps.png",
  "Scorcher": "icons/dps.png",
  "Guardian": "icons/tank.png",
  "Rimefist": "icons/tank.png",
  "Flamefist": "icons/tank.png",
  "Gaia": "icons/tank.png",
  "Luminra": "icons/healer.png",
  "Reso": "icons/healer.png",
  "Sylora": "icons/healer.png",
  "Razorstrike": "icons/assassin.png",
  "Vaporix": "icons/assassin.png",

  // Optional: category icons
  "DPS": "icons/dps.png",
  "Tank": "icons/tank.png",
  "Healer": "icons/healer.png",
  "Assassin": "icons/assassin.png"
};

/*
const roleIcons = {
  "Deadeye": "icons/deadeye.png",
  "Taylor": "icons/taylor.png",
  "Forge": "icons/forge.png",
  "Aeroblade": "icons/aeroblade.png",
  "Ravage": "icons/ravage.png",
  "Scorcher": "icons/scorcher.png",
  "Guardian": "icons/guardian.png",
  "Rimefist": "icons/rimefist.png",
  "Flamefist": "icons/flamefist.png",
  "Gaia": "icons/gaia.png",
  "Luminra": "icons/luminra.png",
  "Reso": "icons/reso.png",
  "Sylora": "icons/sylora.png",
  "Razorstrike": "icons/razorstrike.png",
  "Vaporix": "icons/vaporix.png",

  // Optional: category icons
  "DPS": "icons/dps.png",
  "Tank": "icons/tank.png",
  "Healer": "icons/healer.png",
  "Assassin": "icons/assassin.png"
};
*/

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
  tag.dataset.locked = "false";

  tag.innerHTML = `
  <span class="drag-handle">
    <span class="name">${name}</span>
    <span class="role"></span>
  </span>
  <span class="tag-actions">
    <span class="lock-box" title="Lock player">🔓</span>
    <span class="delete-box">✖</span>
  </span>
`;

  // Append to participants
  document.getElementById("participantsDrop").appendChild(tag);

  /* -------------------------
     DESKTOP DRAG
  -------------------------- */
  tag.addEventListener("dragstart", (e) => {
    if (tag.dataset.locked === "true") {
      e.preventDefault();
      return;
    }
    if (e.target.closest(".delete-box") || e.target.closest(".lock-box")) {
      e.preventDefault();
      return;
    }
    draggedTag = tag;
  });

  /* -------------------------
     MOBILE TOUCH DRAG
  -------------------------- */
  tag.addEventListener("touchstart", (e) => {
    if (tag.dataset.locked === "true") return;
    if (e.target.closest(".delete-box") || e.target.closest(".lock-box")) return;

    draggedTag = tag;
    tag.classList.add("dragging");
    tag.style.zIndex = 1000;

    e.preventDefault();
  });

  tag.addEventListener("touchmove", (e) => {
    if (!draggedTag) return;
    const touch = e.touches[0];
    const parentRect = tag.parentElement.getBoundingClientRect();

    tag.style.position = "absolute";
    tag.style.left = touch.clientX - parentRect.left - tag.offsetWidth / 2 + "px";
    tag.style.top = touch.clientY - parentRect.top - tag.offsetHeight / 2 + "px";

    e.preventDefault();
  });

  tag.addEventListener("touchend", (e) => {
    if (!draggedTag) return;
    const touch = e.changedTouches[0];

    draggedTag.style.display = "none";
    const dropZone = document
      .elementFromPoint(touch.clientX, touch.clientY)
      ?.closest(".dropzone");
    draggedTag.style.display = "";

    if (dropZone) {
      dropZone.appendChild(draggedTag);

      if (dropZone.id === "participantsDrop") {
        const roleSpan = draggedTag.querySelector(".role");
        if (roleSpan) roleSpan.textContent = "";
      }
    }

    draggedTag.style.position = "";
    draggedTag.style.left = "";
    draggedTag.style.top = "";
    draggedTag.style.zIndex = "";
    draggedTag.classList.remove("dragging");
    draggedTag = null;
  });

  /* -------------------------
     LOCK BUTTON
  -------------------------- */
  const lockBox = tag.querySelector(".lock-box");
  lockBox.addEventListener("click", (e) => {
    e.stopPropagation();

    const locked = tag.dataset.locked === "true";
    tag.dataset.locked = (!locked).toString();

    lockBox.textContent = locked ? "🔓" : "🔒";
    tag.classList.toggle("locked", !locked);
  });

  /* -------------------------
     DELETE BUTTON
  -------------------------- */
  const deleteBox = tag.querySelector(".delete-box");
  deleteBox.addEventListener("click", (e) => {
    e.stopPropagation();
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
  const identicalTeams = document.getElementById("identicalTeamsCheckbox").checked;

  if (identicalTeams) {
    // Assign roles to attackers first
    const attackers = Array.from(document.getElementById("attackersDrop").querySelectorAll(".tag"));
    const rolesAssigned = assignRolesToPlayers(attackers);

    // Assign the same roles/categories to defenders
    const defenders = Array.from(document.getElementById("defendersDrop").querySelectorAll(".tag"));
    // Shuffle roles so defenders don’t get exact same order
    const rolesCopy = [...rolesAssigned];
    shuffleArray(rolesCopy);

    defenders.forEach((player, index) => {
      player.querySelector(".role").textContent = rolesCopy[index] || "";
    });

  } else {
    // Normal assignment
    assignTeam("attackers");
    assignTeam("defenders");
  }
}

// Helper function to assign roles to list of players (for assign roles)
function assignRolesToPlayers(players) {
  const categoryOnly = document.getElementById("categoryOnlyCheckbox").checked;
  const noDoubleHealer = document.getElementById("noDoubleHealerCheckbox").checked;

  const assignedRoles = [];

  if (categoryOnly) {
    const pools = getCategoryPools(); // max available per category
    const assignedCounts = {};
    Object.keys(pools).forEach(cat => assignedCounts[cat] = 0);

    players.forEach(player => {
      let availableCategories = Object.keys(pools).filter(cat => assignedCounts[cat] < pools[cat]);

      if (noDoubleHealer && assignedCounts["Healer"] > 0) {
        availableCategories = availableCategories.filter(cat => cat !== "Healer");
      }

      if (availableCategories.length === 0) availableCategories = Object.keys(pools);

      const index = Math.floor(Math.random() * availableCategories.length);
      const assignedCategory = availableCategories[index];
      assignedCounts[assignedCategory]++;

      setRoleIcon(player, assignedCategory);
      assignedRoles.push(assignedCategory);
    });

  } else {
    let availableRoles = [...Object.keys(roleCategories)];
    let healerAssigned = false;

    players.forEach(player => {
      if (availableRoles.length === 0) return;

      let index = Math.floor(Math.random() * availableRoles.length);
      let role = availableRoles[index];

      if (roleCategories[role] === "Healer" && noDoubleHealer && healerAssigned) {
        const nonHealerIndex = availableRoles.findIndex(r => roleCategories[r] !== "Healer");
        if (nonHealerIndex !== -1) {
          index = nonHealerIndex;
          role = availableRoles[index];
        }
      }

      if (roleCategories[role] === "Healer") healerAssigned = true;

      availableRoles.splice(index, 1); // remove assigned
      setRoleIcon(player, role);
      assignedRoles.push(role);
    });
  }

  return assignedRoles;
}

function assignTeam(teamId) {
  const team = document.getElementById(teamId + "Drop");
  const players = Array.from(team.querySelectorAll(".tag"));

  const categoryOnly = document.getElementById("categoryOnlyCheckbox").checked;
  const noDoubleHealer = document.getElementById("noDoubleHealerCheckbox").checked;

  if (categoryOnly) {
    const pools = getCategoryPools();
    const assignedCounts = {};
    Object.keys(pools).forEach(cat => assignedCounts[cat] = 0);

    players.forEach(player => {
      let availableCategories = Object.keys(pools).filter(cat => assignedCounts[cat] < pools[cat]);

      if (noDoubleHealer && assignedCounts["Healer"] > 0) {
        availableCategories = availableCategories.filter(cat => cat !== "Healer");
      }

      if (availableCategories.length === 0) availableCategories = Object.keys(pools);

      const index = Math.floor(Math.random() * availableCategories.length);
      const assignedCategory = availableCategories[index];
      assignedCounts[assignedCategory]++;

      setRoleIcon(player, assignedCategory);
    });

  } else {
    let availableRoles = [...Object.keys(roleCategories)];
    let healerAssigned = false;

    players.forEach(player => {
      if (availableRoles.length === 0) return;

      let index = Math.floor(Math.random() * availableRoles.length);
      let role = availableRoles[index];

      if (roleCategories[role] === "Healer" && noDoubleHealer && healerAssigned) {
        const nonHealerIndex = availableRoles.findIndex(r => roleCategories[r] !== "Healer");
        if (nonHealerIndex !== -1) {
          index = nonHealerIndex;
          role = availableRoles[index];
        }
      }

      if (roleCategories[role] === "Healer") healerAssigned = true;

      availableRoles.splice(index, 1); // remove assigned
      setRoleIcon(player, role);
    });
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
    let roleText = player.querySelector(".role")?.textContent.trim() ?? "";

    if (!roleText) return name;

    roleText = roleText.replace(/[()]/g, "");

    return `${name} - ${roleText}`;
  });

  return `${label}: ${formatted.join(", ")}`;
}

function randomizeTeams() {
  const participantsDrop = document.getElementById("participantsDrop");
  const participants = Array.from(
  participantsDrop.querySelectorAll(".tag:not([data-locked='true'])"));

  if (participants.length === 0) return;

  const attackersDrop = document.getElementById("attackersDrop");
  const defendersDrop = document.getElementById("defendersDrop");

  const MAX_TEAM_SIZE = 4;

  const attackersCount = attackersDrop.children.length;
  const defendersCount = defendersDrop.children.length;

  // Teams are full — show message and exit
  if (attackersCount >= MAX_TEAM_SIZE && defendersCount >= MAX_TEAM_SIZE) {
    alert("Teams are full. Drag-and-drop players to free up space.");
    return;
  }

  shuffleArray(participants);

  let aCount = attackersCount;
  let dCount = defendersCount;

  participants.forEach(player => {
    const attackersFull = aCount >= MAX_TEAM_SIZE;
    const defendersFull = dCount >= MAX_TEAM_SIZE;

    if (!attackersFull && !defendersFull) {
      if (Math.random() < 0.5) {
        attackersDrop.appendChild(player);
        aCount++;
      } else {
        defendersDrop.appendChild(player);
        dCount++;
      }
    } else if (!attackersFull) {
      attackersDrop.appendChild(player);
      aCount++;
    } else if (!defendersFull) {
      defendersDrop.appendChild(player);
      dCount++;
    }
  });
}

function remixTeams() {
  const attackersDrop = document.getElementById("attackersDrop");
  const defendersDrop = document.getElementById("defendersDrop");

  const allPlayers = [
    ...attackersDrop.querySelectorAll(".tag"),
    ...defendersDrop.querySelectorAll(".tag")
  ];

  if (allPlayers.length === 0) return;

  // Store original team BEFORE clearing DOM
  const locked = [];
  const unlocked = [];

  allPlayers.forEach(player => {
    const teamId = player.parentElement.id;

    if (player.dataset.locked === "true") {
      locked.push({ player, teamId });
    } else {
      unlocked.push(player);
    }
  });

  shuffleArray(unlocked);

  // Clear teams
  attackersDrop.innerHTML = "";
  defendersDrop.innerHTML = "";

  let aCount = 0;
  let dCount = 0;

  // Reinsert locked players to their original teams
  locked.forEach(({ player, teamId }) => {
    if (teamId === "attackersDrop") {
      attackersDrop.appendChild(player);
      aCount++;
    } else if (teamId === "defendersDrop") {
      defendersDrop.appendChild(player);
      dCount++;
    }
  });

  // Distribute unlocked players
  unlocked.forEach(player => {
    if (aCount <= dCount) {
      attackersDrop.appendChild(player);
      aCount++;
    } else {
      defendersDrop.appendChild(player);
      dCount++;
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

// Updated swap teams to swap unlocked players while preserving 4v4 teams
function swapTeams() {
  const attackersDrop = document.getElementById("attackersDrop");
  const defendersDrop = document.getElementById("defendersDrop");

  const attackers = Array.from(attackersDrop.querySelectorAll(".tag"));
  const defenders = Array.from(defendersDrop.querySelectorAll(".tag"));

  // Separate locked/unlocked
  const lockedAttackers = attackers.filter(p => p.dataset.locked === "true");
  const unlockedAttackers = attackers.filter(p => p.dataset.locked !== "true");

  const lockedDefenders = defenders.filter(p => p.dataset.locked === "true");
  const unlockedDefenders = defenders.filter(p => p.dataset.locked !== "true");

  // Determine how many unlocked players can actually swap
  const swapCount = Math.min(unlockedAttackers.length, unlockedDefenders.length);

  // Randomly pick players to swap if there are more than swapCount
  shuffleArray(unlockedAttackers);
  shuffleArray(unlockedDefenders);

  const attackersToSwap = unlockedAttackers.slice(0, swapCount);
  const defendersToSwap = unlockedDefenders.slice(0, swapCount);

  // Remaining unlocked players that stay
  const attackersRemain = unlockedAttackers.slice(swapCount);
  const defendersRemain = unlockedDefenders.slice(swapCount);

  // Clear current teams
  attackersDrop.innerHTML = "";
  defendersDrop.innerHTML = "";

  // Rebuild teams
  [...lockedAttackers, ...attackersRemain, ...defendersToSwap].forEach(p => attackersDrop.appendChild(p));
  [...lockedDefenders, ...defendersRemain, ...attackersToSwap].forEach(p => defendersDrop.appendChild(p));
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

// Function to set role icons (custom images)
/*
function setRoleIcon(player, role) {
  const roleSpan = player.querySelector(".role");
  roleSpan.innerHTML = "";

  const img = document.createElement("img");
  img.src = roleIcons[role] || "";
  img.alt = role;
  img.title = role;
  img.className = "role-icon";

  const text = document.createElement("span");
  text.textContent = role;

  roleSpan.appendChild(img);
  roleSpan.appendChild(text);
}
*/

// Set role icons (temporary color cards)
function setRoleIcon(player, role) {
  const roleSpan = player.querySelector(".role");
  roleSpan.innerHTML = "";

  // Define colors per category
  const categoryColors = {
    "DPS": "#a1424c",      // red
    "Tank": "#3f5e7b",     // blue
    "Healer": "#446a62",   // green
    "Assassin": "#6a588c"  // purple
  };

  // Determine the category for this role
  // If role is already a category, use it directly
  const category = roleCategories[role] || role; 
  const color = categoryColors[category] || "#95a5a6"; // fallback gray

  // Create colored box
  const box = document.createElement("span");
  box.style.display = "inline-block";
  box.style.width = "20px";
  box.style.height = "20px";
  box.style.backgroundColor = color;
  box.style.marginRight = "5px";
  box.style.verticalAlign = "middle";
  box.style.borderRadius = "3px"; // optional rounded corners
  box.title = role; // hover text

  // Create text label
  const text = document.createElement("span");
  text.textContent = role;

  roleSpan.appendChild(box);
  roleSpan.appendChild(text);
}

//_________________________ Help Button _____________________________________

const helpBtn = document.getElementById("helpBtn");
const helpModal = document.getElementById("helpModal");
const closeHelpBtn = document.getElementById("closeHelpBtn");

// Open popup
helpBtn.addEventListener("click", () => {
  helpModal.classList.remove("hidden");
});

// Close popup (X button)
closeHelpBtn.addEventListener("click", () => {
  helpModal.classList.add("hidden");
});

// Close popup when clicking outside the box
helpModal.addEventListener("click", (e) => {
  if (e.target === helpModal) {
    helpModal.classList.add("hidden");
  }
});

// Optional: close with ESC key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    helpModal.classList.add("hidden");
  }
});

