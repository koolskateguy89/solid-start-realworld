import { type VoidComponent, For } from "solid-js";
import { A } from "solid-start";

import type { Article } from "~/types/api";

export type ArticlePreviewProps = Article;

const ArticlePreview: VoidComponent<ArticlePreviewProps> = (props) => {
  const createdAt = () =>
    new Date(props.createdAt).toLocaleDateString("en-GB", {
      dateStyle: "long",
    });

  return (
    <article class="article-preview">
      <div class="article-meta">
        <A href={`/profile/${props.author.username}`}>
          <img src={props.author.image} alt={props.author.username} />
        </A>
        <div class="info">
          <A href={`/profile/${props.author.username}`} class="author">
            {props.author.username}
          </A>
          <span class="date">{createdAt()}</span>
        </div>
        <button
          type="button"
          class="btn btn-sm pull-xs-right"
          classList={{
            "btn-primary": props.favorited,
            "btn-outline-primary": !props.favorited,
          }}
        >
          <i class="ion-heart" /> {props.favoritesCount}
        </button>
      </div>
      <A href={`/article/${props.slug}`} class="preview-link">
        {/* TODO: probably want to limit length */}
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
