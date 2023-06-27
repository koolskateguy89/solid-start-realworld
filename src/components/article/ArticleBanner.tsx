import type { VoidComponent } from "solid-js";

import type { Article } from "~/types/api";
import ArticleMeta, { ArticleMetaSkeleton } from "./ArticleMeta";

export type ArticleBannerProps = Article;

const ArticleBanner: VoidComponent<ArticleBannerProps> = (props) => (
  <div class="banner">
    <div class="container">
      <h1>{props.title}</h1>
      <ArticleMeta {...props} />
    </div>
  </div>
);

export default ArticleBanner;

export const ArticleBannerSkeleton: VoidComponent = () => (
  <div class="banner">
    <div class="container">
      <h1>&nbsp;</h1>
      <ArticleMetaSkeleton />
    </div>
  </div>
);
