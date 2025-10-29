export interface CardData {
  id: string;
  imageUrl: string;
  category: string;
  title: string;
  description: string;
  skills: string[];
  location?: string;
  duration?: string;
  tags: string[];
  matchingTags: string[];
}
