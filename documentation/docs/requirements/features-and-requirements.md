# 🦛 Hippo Game Requirements 

## 🧩 Functional Requirements

### 🎮 Core Gameplay
- The game must allow up to **4 Hippo players**, each positioned at one edge of the screen (top, bottom, left, right).
- Hippos must be able to **slide along their edge** (left-right for horizontal edges, up-down for vertical edges).
- Hippos can **catch Food and traps** launched during the game.
- **Food and traps must be visually distinct** with clear icons.
- Food spawning must be **continuous** to ensure smooth gameplay.
- **Fairness**: Food spawning logic must ensure all players have **equal opportunities** to catch the AAC-selected food.
- Food may spawn from **different points** on the map (not just the center) for variety.
- Presenter/Spectator view must **mirror the hippo player view** to support joint attention.

### 🎯 AAC Game Conductor Role
- An **AAC (Augmentative and Alternative Communication) user** acts as the **Game Conductor**.
- The AAC user must be able to:
  - Choose the **type of food or trap**.
  - **Launch** the selected object into the play area.
  - Use **verbs and modifiers** such as "eat," "don’t eat," "more" to create simple commands.
- The AAC board must:
  - Provide **audio feedback (speech output)** for every button press.
  - Support **customizable categories** to limit options (e.g., max ~10 visible items).
  - Be optimized for **touchscreen use** with large buttons and simple folder navigation.

### 🍓 Object Types
- **Food** is catchable for points.
- **Traps** (burn, freeze, grow) negatively affect Hippos.
- Catching the wrong food or trap should trigger **visual and audio effects** (e.g., a hippo "throwing up" animation for poison).

### 🧠 Scoring & Feedback
- Hippos earn points for **catching correct food**.
- Provide **fun, animated feedback** for events (catch, trap effects).
- **Leaderboard** must be **visual**:
  - Use **hippo colors, icons, or progress bars** instead of text labels or numbers.
- Game must have a clear **progress indicator or game over screen**.

### 👀 Spectator Mode
- A **spectator mode** must allow observers to watch gameplay in real time.
- Spectators should see:
  - Player hippos
  - Current food/trap state
  - Visual leaderboard

---

## 🧑‍💻 Facilitator/Admin Features
- Provide a **facilitator panel** to:
- Pre-configure **game rooms** with specific settings.

---

## 📊 Research & Data Logging
- The game must **log key actions with timestamps**, including:
  - AAC user selections (e.g., "User clicked Apple").
  - Player catches (correct/wrong food).
  - Trap interactions.
- Logs should be stored in the database (**Postgres**) and be **exportable (CSV/JSON)** for research use.

---

## 🛠️ Non-Functional Requirements

### 💡 Accessibility
- Autism-friendly design:
  - **Low sensory load**: plain, non-distracting background.
  - **High contrast** between hippos, food, and background.
  - Optional **muted/low-sound mode**.
- AAC interface must be **simple, large-buttoned, and optimized for touchscreens**.
- Game **mode and role selection must be icon-based**, avoiding text or dropdown menus.

### 📱 Usability
- Must work on **desktop, laptop, or tablet**.
- Controls must be **intuitive for touchscreens and desktops**:
  - Touchscreen: swipe or large on-screen buttons.
  - Desktop: arrow keys **or alternative visual controls**.
- UI must **minimize text** where possible, relying on **icons and colors**.

### ⚙️ Performance
- Game must run **smoothly (≥ 30 FPS)** even with multiple objects on screen.
- Use **real-time synchronization** via WebSockets with **movement interpolation** to reduce jitter.
- Physics (bounce, expiration, collisions) must remain accurate and lightweight.

### 🔐 Reliability
- Game state must **not crash or freeze** during normal play.
- Players should be able to **reconnect** without breaking game state.

### 🔧 Maintainability
- Code must be **modular and well-structured**, especially for:
  - Movement strategies
  - Food/trap spawning logic
  - AAC interface
- Include **unit tests** for critical features (movement, spawning, scoring, WebSocket state sync).

---


