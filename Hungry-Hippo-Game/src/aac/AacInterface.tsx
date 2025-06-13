import React from "react";
import { AacFood, AAC_DATA } from "../Foods";

// Callback function to handle fruit selection
interface AacInterfaceProps {
  onFoodSelected: (food: AacFood) => void;
}

const AacInterface: React.FC<AacInterfaceProps> = ({ onFoodSelected }) => {
  // State to keep track of the selected foods
  const [selectedFood, setSelectedFood] = React.useState<AacFood | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = React.useState(false);

  const handleFoodClick = (food: AacFood) => {
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

  // Categorize AAC items by category
  const renderCategoryView = () => {
    return (
      <div className="aac-grid aac-grid-categories">
        {AAC_DATA.categories.map((category) => (
          <button
            key={category.categoryName}
            onClick={() => setSelectedCategory(category.categoryName)}
            disabled={isAudioPlaying}
            className={"aac-food-button aac-category-button"}
          >
            <img
              src={category.categoryIcon}
              alt={category.categoryName}
              className="aac-food-image aac-category-icon"
            />
            {category.categoryName}
          </button>
        ))}
      </div>
    );
  };

  // Get the categorized AAC foods based on the selected category
  const renderFoodsView = () => {
    const category = AAC_DATA.categories.find(cat => cat.categoryName === selectedCategory);
    if (!category) return null;
    return (
      <div className="aac-grid aac-grid-foods">
        {/* Back Button */}
        <button
          onClick={() => setSelectedCategory(null)}
          disabled={isAudioPlaying}
          className="aac-food-button aac-back-button"
        >
          <img
            src="/assets/categories/back.png"
            alt="Back"
            className="aac-food-image aac-back-icon"
          />
          Back
        </button>
        
        {/* Food items for the selected category */}
        {category.foods.map((food) => (
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
    );
  };
        

  return (
    <div className="aac-container">
      <div className="aac-device">
        <h1> AAC Device </h1>

        {/* Display the selected fruit */}
        <div className="aac-foods">
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
        {selectedCategory === null ? renderCategoryView() : renderFoodsView()}
      </div>
    </div>
  );
};

export default AacInterface;