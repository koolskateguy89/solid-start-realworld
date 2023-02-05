import type { VoidComponent } from "solid-js";
import { A } from "solid-start";

import type { Article } from "~/types/api";
import { formattedDate } from "~/lib/utils";

export type ArticleMetaProps = Pick<
  Article,
  "author" | "createdAt" | "favorited" | "favoritesCount"
>;

const ArticleMeta: VoidComponent<ArticleMetaProps> = (props) => {
  const postedAt = () => formattedDate(props.createdAt);

  return (
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
        <span class="date">{postedAt()}</span>
      </div>
      <button
        type="button"
        class="btn btn-sm"
        classList={{
          "btn-secondary": props.author.following,
          "btn-outline-secondary": !props.author.following,
        }}
      >
        <i class="ion-plus-round" />
        &nbsp; {props.author.following ? "Unfollow" : "Follow"}{" "}
        {props.author.username}
      </button>
      &nbsp;&nbsp;
      <button
        type="button"
        class="btn btn-sm"
        classList={{
          "btn-primary": props.favorited,
          "btn-outline-primary": !props.favorited,
        }}
      >
        <i class="ion-heart" />
        &nbsp; {props.favorited ? "Unfavorite" : "Favorite"} Post{" "}
        <span class="counter">({props.favoritesCount})</span>
      </button>
    </div>
  );
};

export default ArticleMeta;
