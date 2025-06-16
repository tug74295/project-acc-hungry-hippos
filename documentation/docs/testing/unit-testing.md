---
sidebar_position: 1
---
# Unit tests

Frontend testing is done via Vitest and React Testing Library. 

| Student | Library | Why We Chose It | Key Features | Modules Covered |
| --------| --------| ----------------| -------------| ----------------|
| Kostandin Jorgji | Vitest & React Testing Library | Vite integration, fast TypeScript support, RTL mirrors how users interact with the app | userEvent & render | AacInterface.tsx, Foods.ts
| Omais Khan | Vitest | Works out-of-the-box with Vite + TypeScript | vi.fn(), isolated test logic | Game.ts |
| Student |
| Student |
| Student |

# Frontend

## AacInterface

### Handling Food Click
    * Input / User Action
        * Use taps a food button
    * Expected Result
        * `selectedFood` state updated to the tapped food
        * `onFoodSelected(food)` callback invoked 
        * `Audio.play()` called with the selected food.mp3

### Navigate to Foods Grid
    * Input / User Action
        * User taps a category button
    * Expected Result
        * `selectedCategory` state set to that fruit
        * Food grid for that category rendered

### Back to categories
    * Input / User Action
        * While viewing foods grid, user taps the back button
    * Expected Result
        * `selectedCategory` cleared
        * Categiry grid reappears

### Selected food indicator updates
    * Input / user Action
        * User taps a food
    * Expected Result
        * Indicator shows the selected food

## Game.ts

### Method: `setFoodKeys(keys: string[])`

* **Purpose:** Defines which food keys are allowed to be spawned.
* **Test Case:**
    - **Input:** `['apple', 'pizza']`
    - **Expected Result:** `foodKeys` field is updated with these values.

---

### Method: `addFoodManually(foodKey: string)`

* **Purpose:** Manually adds a food item to the game (e.g. from AAC).
* **Test Case:**
    - **Input:** `'apple'`
    - **Mocked:** `foods.create`, `setScale`, `setVelocityY`, `setBounce`, `setCollideWorldBounds`
    - **Expected Result:**
        - `foods.create()` called with a lane `x` and `'apple'`
        - All config methods called with correct values

---

### Method: `spawnFood()`

* **Purpose:** Automatically spawns food from a random key and lane.
* **Test Case:**
    - **Precondition:** `foodKeys = ['apple']`
    - **Mocked:** `Phaser.Utils.Array.GetRandom`, `foods.create`
    - **Expected Result:** `foods.create()` called with valid food key and lane

---

### Method: `handleFoodCollision(hippoObj, foodObj)`

* **Purpose:** Removes food when it overlaps with the hippo.
* **Test Case:**
    - **Input:** a food object with `.destroy()` mocked
    - **Expected Result:** `destroy()` called on food

---

### Method: `update()`

* **Purpose:** Removes any food object that touches the ground.
* **Test Case:**
    - **Input:** a group of food objects, some with `body.blocked.down = true`
    - **Expected Result:** Only those with `blocked.down = true` are destroyed
