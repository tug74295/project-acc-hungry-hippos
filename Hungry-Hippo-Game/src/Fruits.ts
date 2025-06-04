export interface Fruit {
    id: string;
    name: string;
    imagePath: string;
    audioPath: string; 
}

export const AAC_ITEMS: Fruit[] = [
  {id: "apple", name: "Apple", imagePath: "/assets/apple.png", audioPath: "/assets/audio/apple.mp3"},
  {id: "banana", name: "Banana", imagePath: "/assets/banana.png", audioPath: "/assets/audio/banana.mp3"},
  {id: "cherry", name: "Cherry", imagePath: "/assets/cherry.png", audioPath: "/assets/audio/cherry.mp3"},
  {id: "grape", name: "Grape", imagePath: "/assets/grape.png", audioPath: "/assets/audio/grape.mp3"},
];