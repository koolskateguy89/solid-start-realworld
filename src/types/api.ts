// https://realworld-docs.netlify.app/docs/specs/backend-specs/api-response-format/

export interface ErrorResponse<TError = unknown> {
  errors: TError;
}

export type User = {
  email: string;
  token: string;
  username: string;
  bio: string;
  image: string;
};

export type Profile = {
  username: string;
  bio: string;
  image: string;
  following: boolean;
};

export type Article = {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: Profile;
};

export type MultipleArticles = {
  articles: Article[];
  articlesCount: number;
};

export type Comment = {
  id: number;
  createdAt: string;
  updatedAt: string;
  body: string;
  author: Profile;
};

export type MultipleComments = {
  comments: Comment[];
};

export type ListOfTags = {
  tags: string[];
};
