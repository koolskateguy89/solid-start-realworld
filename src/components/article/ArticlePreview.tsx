import { type VoidComponent, For } from "solid-js";
import { A } from "solid-start";

import type { Article } from "~/types/api";
import { formattedDate } from "~/lib/utils";
import PreviewFavoriteButton from "./PreviewFavoriteButton";

export type ArticlePreviewProps = Article;

const ArticlePreview: VoidComponent<ArticlePreviewProps> = (props) => {
  const createdAt = () => formattedDate(props.createdAt);

  return (
    <article class="article-preview">
      <div class="article-meta">
        <A href={`/profile/${encodeURIComponent(props.author.username)}`}>
          <img src={props.author.image} alt={props.author.username} />
        </A>

        <div class="info">
          <A
            href={`/profile/${encodeURIComponent(props.author.username)}`}
            class="author"
          >
            {props.author.username}
          </A>
          <span class="date">{createdAt()}</span>
        </div>

        <PreviewFavoriteButton
          slug={props.slug}
          favorited={props.favorited}
          favoritesCount={props.favoritesCount}
        />
      </div>

      <A
        href={`/article/${encodeURIComponent(props.slug)}`}
        class="preview-link"
      >
        {/* TODO: probably want to limit length displayed */}
        <h1>{props.title}</h1>
        <p>{props.description}</p>
        <span>Read more...</span>
        <ul class="tag-list">
          <For each={props.tagList}>
            {(tag) => <li class="tag-default tag-pill tag-outline">{tag}</li>}
          </For>
        </ul>
      </A>
    </article>
  );
};

export default ArticlePreview;
