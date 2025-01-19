const panels = document.querySelectorAll(".panel");
const timeLeftDisplay = document.getElementById("time-left");
const scoreDisplay = document.getElementById("score");
const startGameButton = document.getElementById("start-game");

const resultModal = document.getElementById("result-modal");
const fastestTimeDisplay = document.getElementById("fastest-time");
const slowestTimeDisplay = document.getElementById("slowest-time");
const averageTimeDisplay = document.getElementById("average-time");
const closeModalButton = document.getElementById("close-modal");

const pingSound = new Audio("png.mp3");
const buzzSound = new Audio("buzz.mp3");

let score = 0;
let timeLeft = 60;
let gameInterval;
let panelTimeout;
let activePanel = null;
let lastPanel = null; // Track the last active panel
let reactionTimes = [];
let gameStartTime;

let panelActiveTime = 500; // Initial time a panel stays active (in ms)
const finalPanelActiveTime = 300; // Minimum active time in ms

// Activate a random panel, ensuring it's different from the last one
function activatePanel() {
  deactivatePanel();

  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * panels.length);
  } while (panels[randomIndex] === lastPanel); // Ensure it's not the last panel

  activePanel = panels[randomIndex];
  lastPanel = activePanel; // Update the last active panel

  activePanel.classList.add("active");
  gameStartTime = Date.now();

  pingSound.currentTime = 0; // Reset sound
  pingSound.play();

  // Automatically deactivate the panel after the current active time
  panelTimeout = setTimeout(() => {
    deactivatePanel();
    if (timeLeft > 0) activatePanel(); // Move to the next panel if time remains
  }, panelActiveTime);
}

// Deactivate the active panel
function deactivatePanel() {
  if (activePanel) {
    activePanel.classList.remove("active");
    activePanel = null;
    clearTimeout(panelTimeout);
  }
}

// Handle panel click
panels.forEach((panel) => {
  panel.addEventListener("click", (event) => {
    if (panel.classList.contains("active")) {
      const reactionTime = Date.now() - gameStartTime;
      reactionTimes.push(reactionTime);
      score++;
      scoreDisplay.textContent = score;

      deactivatePanel();
      createParticleEffect(event); // Add particle effect
      activatePanel(); // Activate the next panel immediately
    } else {
      buzzSound.currentTime = 0; // Reset sound
      buzzSound.play();
    }
  });
});

// Gradually adjust `panelActiveTime` based on remaining time
function adjustPanelActiveTime() {
  const elapsedTime = 60 - timeLeft; // Time since the game started
  const progress = elapsedTime / 60; // Progress (0 to 1)
  panelActiveTime =
    finalPanelActiveTime +
    (500 - finalPanelActiveTime) * (1 - progress); // Gradually reduce time
}

// Create neon particle effect
function createParticleEffect(event) {
  const panel = event.target;
  const rect = panel.getBoundingClientRect();
  const particleCount = 20;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.classList.add("particle");
    const x = Math.random() * rect.width - rect.width / 2;
    const y = Math.random() * rect.height - rect.height / 2;
    particle.style.setProperty("--x", `${x}px`);
    particle.style.setProperty("--y", `${y}px`);
    panel.appendChild(particle);

    particle.addEventListener("animationend", () => {
      particle.remove();
    });
  }
}

// Start the game
startGameButton.addEventListener("click", () => {
  resetGame();
  activatePanel(); // Activate the first panel immediately

  gameInterval = setInterval(() => {
    timeLeft--;
    timeLeftDisplay.textContent = timeLeft;

    adjustPanelActiveTime(); // Gradually reduce panel active time

    if (timeLeft <= 0) endGame();
  }, 1000);
});

// Reset the game
function resetGame() {
  score = 0;
  timeLeft = 60;
  reactionTimes = [];
  panelActiveTime = 500; // Reset panel active time to initial value
  timeLeftDisplay.textContent = timeLeft;
  scoreDisplay.textContent = score;
  deactivatePanel();
  clearInterval(gameInterval);
  lastPanel = null; // Reset the last active panel
}

// End the game
function endGame() {
  clearInterval(gameInterval);
  deactivatePanel();
  showResults();
}

// Show results
function showResults() {
  const fastestTime = Math.min(...reactionTimes);
  const slowestTime = Math.max(...reactionTimes);
  const averageTime = Math.floor(
    reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
  );

  fastestTimeDisplay.textContent = fastestTime || "N/A";
  slowestTimeDisplay.textContent = slowestTime || "N/A";
  averageTimeDisplay.textContent = averageTime || "N/A";

  resultModal.style.display = "flex";
}

// Close modal
closeModalButton.addEventListener("click", () => {
  resultModal.style.display = "none";
});
