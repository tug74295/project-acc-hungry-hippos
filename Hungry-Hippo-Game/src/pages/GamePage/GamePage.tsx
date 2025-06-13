import React, { useRef } from 'react';
import { IRefPhaserGame, PhaserGame } from '../../PhaserGame';
import AacInterface from '../../aac/AacInterface';
import { AacFood } from '../../Foods';

const GamePage: React.FC = () => {
    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);


    const [foodStack, setFoodStack] = React.useState<AacFood[]>([]);
    const handleSelectedFood = (selectedFood: AacFood) => {
        setFoodStack(previousStack => [selectedFood, ...previousStack]);

        // Spawn the selected food in the Phaser scene and make it fall
        if (phaserRef.current) {
            const scene = phaserRef.current.scene as any;
            if (scene && typeof scene.addFruitManually === 'function') {
                scene.addFruitManually(selectedFood.id);
            }
            
        }
    };

    // Get the current selected food (top of stack)
    const currentFood = foodStack.length > 0 ? foodStack[0] : null;

    return (
        <div id="app">
            <AacInterface onFoodSelected={handleSelectedFood}/>
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
                        <p className="current-food-placeholder">No Fruit Selected</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default GamePage;
