---
sidebar_position: 1
---
# Unit tests

Frontend testing is done via Vitest and React Testing Library. 

| Student | Library | Why We Chose It | Key Features | Modules Covered |
| --------| --------| ----------------| -------------| ----------------|
| Kostandin Jorgji | Vitest & React Testing Library | Vite integration, fast TypeScript support, RTL mirrors how users interact with the app | userEvent & render | AacInterface.tsx, Foods.ts
| Student |
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