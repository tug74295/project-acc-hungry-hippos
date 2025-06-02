import React, { useRef } from 'react';
import { IRefPhaserGame, PhaserGame } from './PhaserGame';
import AacInterface from './aac/AacInterface';

interface Fruit {
    id: string;
    name: string;
    imagePath: string;
}

function App()
{
    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    const addSprite = () => {

        if (phaserRef.current)
        {
            const scene = phaserRef.current.scene;

            if (scene)
            {
                // Add a new sprite to the current scene at a random position
                const x = Phaser.Math.Between(64, scene.scale.width - 64);
                const y = Phaser.Math.Between(64, scene.scale.height - 64);
    
                //  `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
                // const star = scene.add.sprite(x, y, 'star');
    
            }
        }
    }

    
    const [fruitStack, setFruitStack] = React.useState<Fruit[]>([]);
    const handleSelectedFruit = (selectedFruit: Fruit) => {
        // Update the fruit stack with the selected fruit
        setFruitStack(previousStack => {
            console.log("Selected Fruit:", selectedFruit);
            const newStack = [selectedFruit, ...previousStack];
            console.log('Selected Fruit:', newStack);
            return newStack;
       });
    };

    // Get the current selected fruit (top of stack)
    const currentFruit = fruitStack.length > 0 ? fruitStack[0] : null;

    return (
        <div id="app">
            <AacInterface onFruitSelected={handleSelectedFruit}/>
            <div className="game-container">
                <PhaserGame ref={phaserRef} />
                
                <div className="current-fruit-indicator">
                    <h3>Current Fruit to Eat:</h3>
                    {currentFruit ? (
                        <>
                            <img
                                src={currentFruit.imagePath}
                                alt={currentFruit.name}
                                className="current-fruit-image"
                            />
                            <p className="current-fruit-name">{currentFruit.name}</p>
                        </>
                    ) : (
                        <p className="current-fruit-placeholder">No Fruit Selected</p>
                    )}
                </div>
                
                <div>
                    <div>
                        <button className="button" onClick={addSprite}>Add New Sprite</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App
