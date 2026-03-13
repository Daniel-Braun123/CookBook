import { Category } from "./category";

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
  //ingredients: Ingredient[]; // muss weg
  //steps: CookingStep[]; // muss weg
  //nutrition?: NutritionInfo; // muss weg
  createdAt: string;
  isSaved?: boolean;
}

export interface Author {
  id: string;
  name: string;
  profilePicture: string;
  bio?: string
}

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
}

export interface CookingStep {
  id: string;
  stepNumber: number;
  instruction: string;
  image?: string;
  duration?: number;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}
