import { Category } from "./category";
import { Author } from "./author";

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  prepTime: number;
  cookTime: number;
  difficulty: 'EINFACH' | 'MITTEL' | 'SCHWER';
  servings: number;
  category: Category;
  tags: string[];
  author: Author;
  createdAt: string;
  isSaved?: boolean;
}
