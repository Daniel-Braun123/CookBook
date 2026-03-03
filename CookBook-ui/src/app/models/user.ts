export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  savedRecipes: string[];
  ownRecipes: string[];
  joinedAt: string;
}
