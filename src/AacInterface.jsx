const AAC_ITEMS = [
  {id: "apple", name: "Apple", imagePath: "static/img/apple.png"},
  {id: "banana", name: "Banana", imagePath: "static/img/banana.png"},
  {id: "cherry", name: "Cherry", imagePath: "static/img/cherry.png"},
  {id: "grapes", name: "Grapes", imagePath: "static/img/grape.png"},
];

function AacInterface() {
   /*
  selectedFruit is used to track the currently selected fruit in the AAC.
  setSelectedFruit is a function that updates the selectedFruit state.
  */
  const [selectedFruit, setSelectedFruit] = React.useState(null);

  const handleFruitClick = (fruit) => {
    // Update the selected fruit when an AAC item is clicked
    // ============ TODO: Add logic to handle item selection (Audio, Firebase, Game) ============ //
    setSelectedFruit(fruit);
    console.log(`${fruit.name} selected!`); // For demonstration
  };

  return (
    <div className="aac-container">
      <div className="aac-device">
        <h1 className="aac-title"> AAC Device </h1>

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
            <p className="aac-instruction">Click on a fruit to select it</p>
          )}
        </div>

        <div className="aac-grid">
          {AAC_ITEMS.map((fruit) => (
            <button
              key={fruit.id}
              onClick={() => handleFruitClick(fruit)}
              className={`aac-button ${selectedFruit && selectedFruit.id === fruit.id ? 'aac-selected' : ''}`}
            >
              <img
                src={fruit.imagePath}
                alt={fruit.name}
                className="aac-fruit-image" />
              {fruit.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AacInterface />);