import React from "react";
import { AacFood, CATEGORIZED_AAC_ITEMS } from "../Foods";

// Callback function to handle fruit selection
interface AacInterfaceProps {
  onFruitSelected: (fruit: AacFood) => void;
}

const categories = Object.keys(CATEGORIZED_AAC_ITEMS)

const AacInterface: React.FC<AacInterfaceProps> = ({ onFruitSelected }) => {
  // State to keep track of the selected fruit
  const [selectedFruit, setSelectedFruit] = React.useState<AacFood | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string>(categories[0]);

  const handleFruitClick = (food: AacFood) => {
    // Update the selected fruit when an AAC item is clicked
    // Send the selected fruit to the parent component via the onFruitSelected callback
    setSelectedFruit(food);
    onFruitSelected(food);

    // Play the audio for the selected fruit
    if (food.audioPath) {
      const audio = new Audio(food.audioPath);
      setIsAudioPlaying(true);

      audio.onended = () => {
        setIsAudioPlaying(false);
      };
      audio.onerror = () => {
        console.error(`Error playing audio for ${food.name}`);
        setIsAudioPlaying(false);
      };
      audio.play()
    }
  };

  return (
    <div className="aac-container">
      <div className="aac-device">
        <h1> AAC Device </h1>

        {/* Display the selected fruit */}
        <div className="aac-fruits">
          {selectedFruit ? (
            <p className="aac-selected-fruit"> You selected: {selectedFruit.name} {selectedFruit.imagePath && (
                <img
                  src={selectedFruit.imagePath}
                  alt={selectedFruit.name}
                  className="aac-selected-fruit-image-display"
                />
              )}
            </p>
          ) : (
            <p className="aac-instruction">Click a food to select it</p>
          )}
        </div>

        {/* Category Buttons */}
        <div className="aac-category-selector">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`aac-category-button ${selectedCategory === category ? 'aac-category-selected' : ''}`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Display the AAC items in a grid */}
        <div className="aac-grid">
          {CATEGORIZED_AAC_ITEMS[selectedCategory].map((food) => (
            <button
              key={food.id}
              onClick={() => handleFruitClick(food)}
              disabled={isAudioPlaying}
              className={`aac-food-button ${selectedFruit && selectedFruit.id === food.id ? 'aac-food-selected' : ''}`}
            >
              <img
                src={food.imagePath}
                alt={food.name}
                className="aac-food-image" />
              {food.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AacInterface;