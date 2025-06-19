import React, { useRef } from 'react';
import { IRefPhaserGame, PhaserGame } from '../../PhaserGame';
import { AacFood } from '../../Foods';


/**
 * 
 * @component PhaserPage
 * @description
 * This is a react functional component that serves as the main game interface page. It inlcudes 
 * Augmented and Alternatice Communication) interface for selecting food.
 * Phaser game canvas where the selected food is spawned and animated .
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
const PhaserPage: React.FC = () => {
    //  References to the PhaserGame component (game and scene are exposed)
    /**
     * * @description A React ref pointing to the PhaserGame component instance. 
     * Used to access its scene and methods like addFoodManually.
     */
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    /**
     * 
     * @field foodStack
     * @type {AacFood[]}
     * @description  Stack of selected foods. The top of the stack is the most recent selection
     */

    const [foodStack] = React.useState<AacFood[]>([]);

     /**
     * @field currentFood
     * @type {AacFood | null}
     * @description The food currently at the top of the stack, representing the next food to eat.
     */

    // Get the current selected food (top of stack)
    const currentFood = foodStack.length > 0 ? foodStack[0] : null;

     /**
     * @returns {JSX.Element}
     * @description Renders the AAC interface, Phaser game container, and food status display.
     */

    return (
        <div id="app">
            <div className="game-container">
                <PhaserGame ref={phaserRef} />
                
                <div className="current-food-indicator">
                    <h3>Current Food to Eat:</h3>
                    {currentFood ? (
                        <>
                            <img
                                src={currentFood.imagePath}
                                alt={currentFood.name}
                                className="current-food-image"
                            />
                            <p className="current-food-name">{currentFood.name}</p>
                        </>
                    ) : (
                        <p className="current-food-placeholder">No Food Selected</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PhaserPage;
