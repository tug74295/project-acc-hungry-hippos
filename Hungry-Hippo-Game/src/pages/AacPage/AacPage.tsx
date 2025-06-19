import React from 'react';
import AacInterface from '../../aac/AacInterface';
import { AacFood } from '../../Foods';

/**
 * 
 * @component AacPage
 * @description
 * This is a react functional component that serves as the main game interface page. It inlcudes 
 * Augmented and Alternatice Communication) interface for selecting food.
 * A food stack tracker to show the currently selected food
 * 
 *  Data Fields:
 * - phaserRef: React.MutableRefObject<IRefPhaserGame | null>
 *      Reference to the PhaserGame component, used to access the Phaser scene.
 * - foodStack: AacFood[]
 *      Stack of foods selected by the user from the AAC interface.
 *
 * Purpose:
 * - To provide the main gameplay page, integrating the AAC interface and Phaser game.
 * - To handle food selection and trigger food spawning in the game scene.
 *
 * Methods:
 * - handleSelectedFood(selectedFood: AacFood): void
 *      Handles selection of a food from the AAC interface, adds it to the stack,
 *      and spawns it in the Phaser game scene.
 *
 * - currentFood: AacFood | null
 *      Gets the current selected food (top of the stack).
 *
 * Pre-conditions:
 * - PhaserGame and AacInterface components must be properly implemented and imported.
 *
 * Post-conditions:
 * - The selected food is added to the stack and spawned in the Phaser game.
 *
 * @returns {JSX.Element} The rendered game page.

 */
const AacPage: React.FC = () => {

    /**
     * 
     * @field foodStack
     * @type {AacFood[]}
     * @description  Stack of selected foods. The top of the stack is the most recent selection
     */

    const [foodStack, setFoodStack] = React.useState<AacFood[]>([]);

    /**
     * @function handleSelectedFood
     * @description Handles food selection from the AAC interface:
     * - Adds the selected food to the top of the stack.
     * 
     * @param {AacFood} selectedFood - The food object selected from the AAC interface.
     * 
     * @pre selectedFood must be a valid AacFood object.
     * @post foodStack is updated; Phaser scene will visually spawn the food if available.
     */
    const handleSelectedFood = (selectedFood: AacFood) => {
        setFoodStack(previousStack => [selectedFood, ...previousStack]);
        // Phaser spawning logic removed
    };

     /**
     * @returns {JSX.Element}
     * @description Renders the AAC interface, Phaser game container, and food status display.
     */

    return (
        <div id="app">
            <AacInterface onFoodSelected={handleSelectedFood}/>
        </div>
    )
}

export default AacPage;
