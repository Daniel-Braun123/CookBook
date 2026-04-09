export interface Review {
  id: number;
  stars: number;
  comment: string | null;
  createdAt: string;
  authorName: string;
  authorProfilePicture: string | null;
  authorId: number;
}
