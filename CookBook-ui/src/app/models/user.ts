export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
  bio?: string;
  savedRecipes: string[];
  ownRecipes: string[];
  joinedAt: string;
}
