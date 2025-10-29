import data from './data.json';

export * from "./types";

// JSON 데이터 export
export const needsData = data.needs;
export const givesData = data.gives;
export const needsCategories = data.categories.needsCategories;
export const givesCategories = data.categories.givesCategories;
