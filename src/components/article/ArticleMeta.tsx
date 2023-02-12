import { type VoidComponent, Show } from "solid-js";
import { createRouteAction, A } from "solid-start";

import type { Article } from "~/types/api";
import { useSession } from "~/lib/session";
import { formattedDate } from "~/lib/utils";

export type ArticleMetaProps = Pick<
  Article,
  "author" | "createdAt" | "favorited" | "favoritesCount" | "slug"
>;

const ArticleMeta: VoidComponent<ArticleMetaProps> = (props) => {
  const postedAt = () => formattedDate(props.createdAt);

  const session = useSession();

  const canModify = () => session()?.user?.username === props.author.username;

  const [, deleteAction] = createRouteAction(
    async (slug: string, { fetch }) =>
      await fetch(`/api/articles/${encodeURIComponent(slug)}`, {
        method: "DELETE",
      })
  );

  const deleteArticle = async () => await deleteAction(props.slug);

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
      <Show
        when={canModify()}
        fallback={
          <>
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
          </>
        }
      >
        <A
          class="btn btn-outline-secondary btn-sm"
          href={`/editor/${encodeURIComponent(props.slug)}`}
        >
          <i class="ion-edit" /> Edit Article
        </A>

        <button
          type="button"
          class="btn btn-outline-danger btn-sm"
          onClick={deleteArticle}
        >
          <i class="ion-trash-a" /> Delete Article
        </button>
      </Show>
    </div>
  );
};

export default ArticleMeta;
