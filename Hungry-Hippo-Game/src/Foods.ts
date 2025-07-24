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
        id: "stop",
        name: "Stop",
        imagePath: "/assets/verbs/stop.png",
        audioPath: "/audio/verbs/stop.mp3",
        color: "#9ce3ecff"
    },
    {
        id: "grow",
        name: "Grow",
        imagePath: "/assets/verbs/grow.png",
        audioPath: "/audio/verbs/grow.mp3",
        color: "#38a169"
    },
    {
        id: "hurt",
        name: "Hurt",
        imagePath: "/assets/verbs/hurt.png",
        audioPath: "/audio/verbs/hurt.mp3",
        color: "#f35236ff"
    }
];
