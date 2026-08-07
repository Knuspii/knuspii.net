// --- 0. SIGNATURE ELEMENT: FINGERPRINT & TELEMETRY BAR ---
function initFingerprintBar() {
  const sessionEl = document.getElementById("fp-session");
  const tzEl = document.getElementById("fp-tz");
  const uptimeEl = document.getElementById("fp-uptime");

  // Generates a random 8-character hex session ID
  if (sessionEl) {
    const hex = Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("");
    sessionEl.textContent = hex;
  }

  // Reads the visitor's local time zone
  if (tzEl) {
    try {
      tzEl.textContent =
        Intl.DateTimeFormat().resolvedOptions().timeZone || "--";
    } catch (e) {
      tzEl.textContent = "--";
    }
  }

  // Starts a live uptime counter starting from page load (HH:MM:SS)
  if (uptimeEl) {
    const start = performance.now();
    setInterval(() => {
      const elapsed = Math.floor((performance.now() - start) / 1000);
      const h = String(Math.floor(elapsed / 3600)).padStart(2, "0");
      const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
      const s = String(elapsed % 60).padStart(2, "0");
      uptimeEl.textContent = `${h}:${m}:${s}`;
    }, 1000);
  }
}

// --- 1. TYPEWRITER & LINE ANIMATION LOGIC ---

// Commands and lines simulated in the terminal
const terminalSequence = [
  { type: "cmd", text: "cat about_me.txt" },
  { type: "line", text: "Hi, I am Knuspii and this is my status page." },
  { type: "cmd", text: "./fetch_status --format=grid && ./fetch_me && exit" },
  { type: "line", text: "[SYS] Initializing local environment..." },
  { type: "line", text: "[NET] Connecting to BetterStack API node..." },
  { type: "line", text: "[OK] Handshake established (TLS 1.3 / AES_256_GCM)." },
  { type: "line", text: "[OK] Telemetry stream initialized. Parsing JSON..." },
];

async function startTerminalSequence() {
  const logContainer = document.getElementById("exec-logs");

  // Play typing animation step by step
  for (const step of terminalSequence) {
    if (step.type === "cmd") {
      await sleep(200);

      // Remove old blinking cursors
      const oldCursors = logContainer.querySelectorAll(".cursor");
      oldCursors.forEach((c) => c.remove());

      const cmdWrapper = document.createElement("p");
      cmdWrapper.className = "fade-in-line";
      cmdWrapper.innerHTML = `
        <span class="prompt">knuspii@terminal101:~$</span>
        <span class="cmd"></span><span class="cursor">█</span>
      `;
      logContainer.appendChild(cmdWrapper);

      const cmdTextElement = cmdWrapper.querySelector(".cmd");
      await typeWriter(cmdTextElement, step.text, 35);
    } else if (step.type === "line") {
      await sleep(250);
      const p = document.createElement("p");
      p.className = "exec-info fade-in-line";
      p.innerText = step.text;
      logContainer.appendChild(p);
    }
  }

  await sleep(400);

  // Hide the cursor at the end
  const finalCursors = logContainer.querySelectorAll(".cursor");
  finalCursors.forEach((c) => (c.style.display = "none"));

  revealContent();
}

// Reveals main content after animation completes and fetches status data
function revealContent() {
  document.getElementById("whoami-wrapper").style.display = "block";
  document.getElementById("status-divider").style.display = "flex";
  fetchStatus();
}

// Helper function: Types out text character by character
function typeWriter(element, text, speed) {
  return new Promise((resolve) => {
    element.innerText = "";
    let i = 0;

    function type() {
      if (i < text.length) {
        element.innerText += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        resolve();
      }
    }
    type();
  });
}

// Helper function: Pauses execution for x milliseconds
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- 2. FETCH & RENDER STATUS DATA ---
async function fetchStatus() {
  const wrapper = document.getElementById("status-wrapper");
  wrapper.style.display = "block";

  try {
    // Fetch status.json from Supabase
    const response = await fetch(
      "https://oadiycmveeueuxqssyrk.supabase.co/storage/v1/object/public/knuspii-page/status.json",
      {
        cache: "no-store",
      },
    );

    if (!response.ok) throw new Error(`HTTP_${response.status}`);

    const data = await response.json();
    wrapper.innerHTML = "";

    if (!data || data.length === 0) {
      wrapper.innerHTML =
        '<div class="log-msg">[WARN] No monitors found in status.json.</div>';
      return;
    }

    const myStuff = [];
    const other = [];

    // Separate services into categories
    data.forEach((item) => {
      const nameLower = item.name.toLowerCase();

      if (
        nameLower.includes("knuspii.net") ||
        nameLower.includes("git-top.net") ||
        nameLower.includes("minecraft-server") ||
        item.type === "heartbeat"
      ) {
        myStuff.push(item);
      } else {
        other.push(item);
      }
    });

    // Display groups
    if (myStuff.length > 0) renderGroup("// MY SERVICES", myStuff, wrapper);
    if (other.length > 0) renderGroup("// OTHER SERVICES", other, wrapper);
  } catch (error) {
    console.error("Error fetching status data:", error);

    wrapper.innerHTML = `
      <div class="log-msg" style="color: var(--gruv-red);">
        [CRITICAL] Could not load status.json.
      </div>
    `;
  }
}

// Constructs HTML cards for a monitor group
function renderGroup(title, items, container) {
  const section = document.createElement("div");
  section.className = "group-section fade-in-line";

  const heading = document.createElement("div");
  heading.className = "group-title";
  heading.innerText = title;

  const grid = document.createElement("div");
  grid.className = "grid-container";

  items.forEach((item, index) => {
    let badgeClass = "paused";
    let statusText = "[!] PAUSED";

    if (item.status === "up") {
      badgeClass = "up";
      statusText = "[✔] ONLINE";
    } else if (item.status === "down") {
      badgeClass = "down";
      statusText = "[✖] OFFLINE";
    }

    const card = document.createElement("div");
    card.className = "card card-pop-in";
    card.style.animationDelay = `${index * 80}ms`;

    card.innerHTML = `
      <div class="card-info">
        <span class="type-tag">${item.type}</span>
        <span class="service-name">${item.name}</span>
      </div>
      <span class="badge ${badgeClass}">${statusText}</span>
    `;

    grid.appendChild(card);
  });

  section.appendChild(heading);
  section.appendChild(grid);
  container.appendChild(section);
}

// --- 3. HIGH-PERFORMANCE SPRITE-CACHED ASCII STAR ENGINE ---
const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

// Gruvbox colors and ASCII characters for the stars
const gruvColors = [
  "#ebdbb2",
  "#a89984",
  "#928374",
  "#fabd2f",
  "#fe8019",
  "#83a598",
];
const asciiChars = [".", "*", "+", "✦", "✧", "°", "0", "1"];

// Storage for pre-rendered sprites
const spriteCache = [];

// Pre-rendering: Draws each ASCII character in every color once onto an invisible offscreen canvas
function preRenderSprites() {
  spriteCache.length = 0;

  asciiChars.forEach((char) => {
    gruvColors.forEach((color) => {
      const offCanvas = document.createElement("canvas");
      offCanvas.width = 30;
      offCanvas.height = 30;
      const offCtx = offCanvas.getContext("2d");

      offCtx.fillStyle = color;
      offCtx.font = '16px Consolas, "Fira Code", monospace';
      offCtx.textAlign = "center";
      offCtx.textBaseline = "middle";
      offCtx.fillText(char, 15, 15);

      spriteCache.push(offCanvas);
    });
  });
}

let stars = [];

// Adjusts the canvas to screen size
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initStars();
}

// Debounce canvas resize for performance protection
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(resizeCanvas, 100);
});

// Initializes the starfield depending on display resolution
function initStars() {
  stars = [];
  // Calculate star count based on display area
  const starCount = Math.floor((canvas.width * canvas.height) / 3000);

  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      sprite: spriteCache[Math.floor(Math.random() * spriteCache.length)],
      speed: 0.4 + Math.random() * 1.0,
      opacity: 0.2 + Math.random() * 0.8,
      twinkle: (Math.random() > 0.5 ? 1 : -1) * (0.008 + Math.random() * 0.015),
    });
  }
}

// Calculates new position and twinkling effect for each star
function updateStars(deltaRatio) {
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];

    // Move downwards (speed-adjusted)
    s.y += s.speed * deltaRatio;
    // Twinkle (change opacity)
    s.opacity += s.twinkle * deltaRatio;

    // Reverse twinkle direction when min/max opacity is reached
    if (s.opacity >= 1.0 || s.opacity <= 0.15) {
      s.twinkle = -s.twinkle;
    }

    // Reset star to top if it moves past the bottom of the canvas
    if (s.y > canvas.height + 20) {
      s.y = -20;
      s.x = Math.random() * canvas.width;
    }
  }
}

// Draws all stars using GPU-accelerated image copying (drawImage)
function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    ctx.globalAlpha = Math.max(0.1, Math.min(1, s.opacity));
    ctx.drawImage(s.sprite, s.x - 15, s.y - 15);
  }

  ctx.globalAlpha = 1;
}

let lastTime = 0;
let isPageVisible = true;

// Main animation loop (ensures smooth 60+ FPS)
function animationLoop(currentTime) {
  requestAnimationFrame(animationLoop);

  // Pause animation only when tab is inactive
  if (!isPageVisible) return;

  if (!lastTime) lastTime = currentTime;
  const elapsed = currentTime - lastTime;
  lastTime = currentTime;

  // Normalized to 60FPS base for smooth movement across all monitors
  const deltaRatio = Math.min(elapsed / 16.667, 2.0);

  updateStars(deltaRatio);
  drawStars();
}

// Pause animation when tab visibility changes (saves battery & resources)
document.addEventListener("visibilitychange", () => {
  isPageVisible = !document.hidden;
});

// --- INITIALIZE APPLICATION ---
initFingerprintBar();
preRenderSprites();
resizeCanvas();
requestAnimationFrame(animationLoop);
startTerminalSequence();