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