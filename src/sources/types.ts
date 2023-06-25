export interface Comments {
  title: string;
  points: number;
  url: string;
  num_comments: number;
}

export interface CommentsSource {
  getCommentsFor: (url: string) => Promise<Comments[]>;
}
