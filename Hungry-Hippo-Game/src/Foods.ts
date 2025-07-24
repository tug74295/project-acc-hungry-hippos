import aacData from './data/food.json';

/**
 * Defines the structure for a single food item in the AAC system.
 */
export interface AacFood {
    id: string;
    name: string;
    imagePath: string;
    audioPath: string; 
}

/**
 * Defines the structure for a food category in the AAC system.
 */
export interface AacCategory {
    categoryName: string;
    categoryIcon: string;
    foods: AacFood[];
    categoryAudioPath?: string;
}

/**
 * Defines the structure for the entire AAC data, which includes multiple categories.
 */
export interface AacData {
    categories: AacCategory[];
}

/**
 * Exports the AAC data, which includes categories and their respective foods. This data is imported from a JSON file.
 */
export const AAC_DATA: AacData = aacData as AacData;

export interface AacVerb {
    id: string;
    name: string;
    imagePath: string;
    audioPath: string;
    color?: string;
}

export const AAC_VERBS: AacVerb[] = [
    {
        id: "freeze",
        name: "Freeze",
        imagePath: "/assets/verbs/freeze.png",
        audioPath: "/audio/verbs/freeze.mp3",
        color: "#52869eff"
    },
    {
        id: "grow",
        name: "Grow",
        imagePath: "/assets/verbs/grow.png",
        audioPath: "/audio/verbs/grow.mp3",
        color: "#38a169"
    },
    {
        id: "burn",
        name: "Burn",
        imagePath: "/assets/verbs/burn.png",
        audioPath: "/audio/verbs/burn.mp3",
        color: "#f35236ff"
    }
];
