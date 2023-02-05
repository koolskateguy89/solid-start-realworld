import { type VoidComponent, For } from "solid-js";

import type { Article } from "~/types/api";
import ArticlePreview from "./ArticlePreview";

export type ArticlePreviewsProps = {
  articles: Article[];
};

const ArticlePreviews: VoidComponent<ArticlePreviewsProps> = (props) => {
  return (
    <For each={props.articles}>
      {(article) => <ArticlePreview {...article} />}
    </For>
  );
};

export default ArticlePreviews;
