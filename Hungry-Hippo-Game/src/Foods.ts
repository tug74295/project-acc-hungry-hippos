import aacData from './data/food.json';

export interface AacFood {
    id: string;
    name: string;
    imagePath: string;
    audioPath: string; 
}

export interface AacCategories {
    [category: string]: AacFood[];
}

export const CATEGORIZED_AAC_ITEMS: AacCategories = aacData as AacCategories;