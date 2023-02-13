import { type VoidComponent, Show } from "solid-js";
import { createRouteAction, A } from "solid-start";

import type { Article } from "~/types/api";
import { useSession } from "~/lib/session";
import { formattedDate } from "~/lib/utils";
import FollowButton from "~/components/common/FollowButton";
import MetaFavoriteButton from "./MetaFavoriteButton";

export type ArticleMetaProps = Pick<
  Article,
  "author" | "createdAt" | "favorited" | "favoritesCount" | "slug"
>;

const ArticleMeta: VoidComponent<ArticleMetaProps> = (props) => {
  const session = useSession();
  const canModify = () => session()?.user?.username === props.author.username;

  const postedAt = () => formattedDate(props.createdAt);

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
            <FollowButton
              username={props.author.username}
              following={props.author.following}
              invalidate={["article", props.slug]}
              class="btn btn-sm"
            />
            &nbsp;&nbsp;
            <MetaFavoriteButton
              slug={props.slug}
              favorited={props.favorited}
              favoritesCount={props.favoritesCount}
            />
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
