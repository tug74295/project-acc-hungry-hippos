import React from "react";
import { AacFood, CATEGORIZED_AAC_ITEMS } from "../Foods";

// Callback function to handle food selection
interface AacInterfaceProps {
  onFoodSelected: (food: AacFood) => void;
}

const categories = Object.keys(CATEGORIZED_AAC_ITEMS)

const AacInterface: React.FC<AacInterfaceProps> = ({ onFoodSelected: onFoodSelected }) => {
  // State to keep track of the selected food
  const [selectedFood, setSelectedFood] = React.useState<AacFood | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string>(categories[0]);

  const handleFoodClick = (food: AacFood) => {
    // Update the selected food when an AAC item is clicked
    // Send the selected food to the parent component via the onFoodSelected callback
    setSelectedFood(food);
    onFoodSelected(food);

    // Play the audio for the selected food
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

        {/* Display the selected food */}
        <div className="aac-food">
          {selectedFood ? (
            <p className="aac-selected-food"> You selected: {selectedFood.name} {selectedFood.imagePath && (
                <img
                  src={selectedFood.imagePath}
                  alt={selectedFood.name}
                  className="aac-selected-food-image-display"
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
              onClick={() => handleFoodClick(food)}
              disabled={isAudioPlaying}
              className={`aac-food-button ${selectedFood && selectedFood.id === food.id ? 'aac-food-selected' : ''}`}
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