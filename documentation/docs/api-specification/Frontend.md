---
sidebar_position: 1
description: Frontend API
---

# Frontend API

## Table of Contents

- [AAC Interface](#aac-interface)
  - [`interface AacInterfaceProps`](#interface-aacinterfaceprops)
  - [`onFoodSelected`](#onfoodselected-food-aacfood--void)
  - [`AacInterface` Component](#const-aacinterface-reactfcaacinterfaceprops--)
  - [`selectedFood`](#const-selectedfood-setselectedfood--reactusestateaacfood--null)
  - [`selectedCategory`](#const-selectedcategory-setselectedcategory--reactusestatestring--null)
  - [`isAudioPlaying`](#const-isaudioplaying-setisaudioplaying--reactusestatefalse)
  - [`handleFoodClick`](#const-handlefoodclick--food-aacfood--)
  - [`audio.onerror`](#audioonerror--)
  - [`renderCategoryView`](#const-rendercategoryview--)
  - [`renderFoodsView`](#const-renderfoodsview--)
  - [`AAC Interface JSX`](#return--div-classnameaac-container-div-classnameaac-device-h1-aac-device-)
- [Foods.ts](#foodsts)
  - [`AacFood`](#export-interface-aacfood)
  - [`AacCategory`](#export-interface-aaccategory)
  - [`AacData`](#export-interface-aacdata)
  - [`AAC_DATA`](#export-const-aac_data-aacdata--aacdata-as-aacdata)
- [Game.ts](#gamets)
  - [`Game` class](#class-game-extends-phaserscene)
  - [`hippo`](#private-hippo-phaserphysicsarcadesprite)
  - [`foods`](#private-foods-phaserphysicsarcadegroup)
  - [`foodKeys`](#private-foodkeys-string)
  - [`lanePositions`](#private-lanepositions-number)
  - [`foodSpawnTimer`](#private-foodspawntimer-phasertimetimerevent)
  - [`constructor`](#constructor)
  - [`preload`](#preload)
  - [`create`](#create)
  - [`setFoodKeys`](#setfoodkeyskeys-string)
  - [`startSpawningFood`](#startspawningfood)
  - [`spawnFood`](#spawnfood)
  - [`addFoodManually`](#addfoodmanuallyfoodkey-string)
  - [`handleFoodCollision`](#handlefoodcollisionhippo-food)
  - [`update`](#update)
- [PhaserGame.tsx](#phasergametsx)
  - [`PhaserGame`](#phasergame-reactfciprops)
  - [`IRefPhaserGame`](#interface-irefphasergame)
  - [`IProps`](#interface-iprops)
  - [`useLayoutEffect`](#uselayouteffect)
  - [`useEffect`](#useeffect)
  - [`PhaserGame JSX`](#return)

# AAC Interface

## `interface AacInterfaceProps`

Defines the props for the AacInterface component.

## `onFoodSelected: (food: AacFood) => void`

Callback function to handle food selection.

- **Parameters:** `food` — The selected food item.
- **Returns:** `void` —

## `const AacInterface: React.FC<AacInterfaceProps> = (`

AacInterface component provides an interface for users to select foods and play associated audio clips.

- **Parameters:** `props` — `AacInterfaceProps` — - The properties for the component.
- **Returns:** `JSX.Element` — The rendered component.

## `const [selectedFood, setSelectedFood] = React.useState<AacFood | null>(null)`

Tracks the most recently selected food item

## `const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)`

Tracks the currently selected food category

## `const [isAudioPlaying, setIsAudioPlaying] = React.useState(false)`

Tracks whether audio is currently playing

## `const handleFoodClick = (food: AacFood) =>`

Handles the click event for a food item.

- **Parameters:** `food` — `AacFood` — - The food item that was clicked.
- **Returns:** `void` —

## `audio.onerror = () =>`

- **Exceptions:** function handles errors that may occur while playing the audio.

## `const renderCategoryView = () =>`

Renders the category view with buttons for each food category.

- **Returns:** `JSX.Element` — The rendered category view.

## `const renderFoodsView = () =>`

Renders the foods view for the selected category.

- **Returns:** `JSX.Elemen` — | null} The rendered foods view or null if no category is selected.

## `return ( <div className="aac-container"> <div className="aac-device"> <h1> AAC Device <`

Renders the main AAC interface, including the selected food and category views.

- **Returns:** `JSX.Element` — The rendered AAC interface.

# Foods.ts

## `export interface AacFood`

Defines the structure for a single food item in the AAC system.

## `export interface AacCategory`

Defines the structure for a food category in the AAC system.

## `export interface AacData`

Defines the structure for the entire AAC data, which includes multiple categories.

## `export const AAC_DATA: AacData = aacData as AacData`

Exports the AAC data, which includes categories and their respective foods. This data is imported from a JSON file.

# Game.ts

## `class Game extends Phaser.Scene`

Defines the core gameplay scene using Phaser. Handles spawning food items, collision detection with the hippo, and animations.

## `private hippo: Phaser.Physics.Arcade.Sprite`

Animated hippo character that interacts with food.

## `private foods: Phaser.Physics.Arcade.Group`

Group that contains all active food objects.

## `private foodKeys: string[]`

Tracks food types allowed to spawn, based on AAC selection.

## `private lanePositions: number[]`

Predefined X-axis lanes where food may appear.

## `private foodSpawnTimer: Phaser.Time.TimerEvent`

Timer that triggers periodic spawning of food.

---

## `constructor()`

Initializes the scene with the key `"Game"`.

## `preload()`

Preloads all images and sprite sheets, including dynamically loaded food assets.

## `create()`

Adds hippo, food group, animations, and physics overlaps to the scene.

## `setFoodKeys(keys: string[])`

Sets which food types are currently allowed to spawn.

- **Parameters**: `keys` — string array of food IDs.

## `startSpawningFood()`

Starts a 1500ms interval that repeatedly calls `spawnFood`.

## `spawnFood()`

Chooses a food key and lane, then drops the food with physics.

## `addFoodManually(foodKey: string)`

Allows an external event like AAC selection to spawn a specific food.

## `handleFoodCollision(hippo, food)`

Handles logic when the hippo collides with food. Destroys the food.

## `update()`

Phaser's update loop. Destroys food that hits the ground.

# PhaserGame.tsx

## `PhaserGame: React.FC<IProps>`

A React wrapper component that initializes the Phaser game engine and provides a reference to the game and active scene via `ref`.

## `interface IRefPhaserGame`

Reference structure passed back to parent via `ref`.

- **game**: `Phaser.Game | null` — The Phaser game instance.
- **scene**: `Phaser.Scene | null` — The active scene instance when ready.

## `interface IProps`

Props accepted by the component:

- **currentActiveScene**: `(scene_instance: Phaser.Scene) => void` — Optional callback to notify parent of the active Phaser scene.

---

## `useLayoutEffect`

Initializes the Phaser game on mount and ensures full cleanup on unmount.

---

## `useEffect`

Listens for the `'current-scene-ready'` event. When triggered:

- Injects AAC food keys into the scene using `setFoodKeys`.
- Shares the scene instance via `ref` and `currentActiveScene`.

---

## `return`

Renders a `<div id="game-container">` for mounting the Phaser canvas.
