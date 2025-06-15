---
sidebar_position: 1
description: Frontend API
---

# Frontend API


# AAC Interface
## `interface AacInterfaceProps`

Defines the props for the AacInterface component.

## `onFoodSelected: (food: AacFood) => void`

Callback function to handle food selection.

 * **Parameters:** `food` — The selected food item.
 * **Returns:** `void` — 

## `const AacInterface: React.FC<AacInterfaceProps> = (`

AacInterface component provides an interface for users to select foods and play associated audio clips.

 * **Parameters:** `props` — `AacInterfaceProps` — - The properties for the component.
 * **Returns:** `JSX.Element` — The rendered component.

## `const [selectedFood, setSelectedFood] = React.useState<AacFood | null>(null)`

Tracks the most recently selected food item

## `const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)`

Tracks the currently selected food category

## `const [isAudioPlaying, setIsAudioPlaying] = React.useState(false)`

Tracks whether audio is currently playing

## `const handleFoodClick = (food: AacFood) =>`

Handles the click event for a food item.

 * **Parameters:** `food` — `AacFood` — - The food item that was clicked.
 * **Returns:** `void` — 

## `audio.onerror = () =>`

 * **Exceptions:** function handles errors that may occur while playing the audio.

## `const renderCategoryView = () =>`

Renders the category view with buttons for each food category.

 * **Returns:** `JSX.Element` — The rendered category view.

## `const renderFoodsView = () =>`

Renders the foods view for the selected category.

 * **Returns:** `JSX.Elemen` — | null} The rendered foods view or null if no category is selected.

## `return ( <div className="aac-container"> <div className="aac-device"> <h1> AAC Device <`

Renders the main AAC interface, including the selected food and category views.

 * **Returns:** `JSX.Element` — The rendered AAC interface.


# Foods.ts

## `export interface AacFood`

Defines the structure for a single food item in the AAC system.

## `export interface AacCategory`

Defines the structure for a food category in the AAC system.

## `export interface AacData`

Defines the structure for the entire AAC data, which includes multiple categories.

## `export const AAC_DATA: AacData = aacData as AacData`

Exports the AAC data, which includes categories and their respective foods. This data is imported from a JSON file.