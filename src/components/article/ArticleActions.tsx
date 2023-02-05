import type { VoidComponent } from "solid-js";

import type { Article } from "~/types/api";
import ArticleMeta from "./ArticleMeta";

export type ArticleActionsProps = Pick<
  Article,
  "author" | "createdAt" | "favorited" | "favoritesCount"
>;

const ArticleActions: VoidComponent<ArticleActionsProps> = (props) => (
  <div class="article-actions">
    <ArticleMeta {...props} />
  </div>
);

export default ArticleActions;
