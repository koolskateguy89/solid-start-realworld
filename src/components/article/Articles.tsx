import { type VoidComponent, For } from "solid-js";

import type { Article } from "~/types/api";
import ArticlePreview from "./ArticlePreview";

export type ArticlesProps = {
  articles: Article[];
};

const Articles: VoidComponent<ArticlesProps> = (props) => {
  return (
    <For each={props.articles}>
      {(article) => <ArticlePreview {...article} />}
    </For>
  );
};

export default Articles;
