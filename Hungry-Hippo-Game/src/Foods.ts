import aacData from './data/food.json';

export interface AacFood {
    id: string;
    name: string;
    imagePath: string;
    audioPath: string; 
}

export interface AacCategory {
    categoryName: string;
    categoryIcon: string;
    foods: AacFood[];
}

export interface AacData {
    categories: AacCategory[];
}

export const AAC_DATA: AacData = aacData as AacData;