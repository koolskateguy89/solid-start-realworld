import type { VoidComponent } from "solid-js";
import { Show } from "solid-js";
import { createRouteAction, useParams, A } from "solid-start";

import type { Comment as CommentType } from "~/types/api";
import { formattedDate } from "~/lib/utils";
import { useSession } from "~/lib/session";

export type CommentProps = Pick<CommentType, "body" | "createdAt" | "id"> & {
  author: Pick<CommentType["author"], "username" | "image">;
};

const Comment: VoidComponent<CommentProps> = (props) => {
  const session = useSession();

  const canModify = () => session()?.user?.username === props.author.username;

  const postedAt = () => formattedDate(props.createdAt);

  const params = useParams<{ slug: string }>();

  const [deleting, deleteAction] = createRouteAction(
    async ({ slug, id }: { slug: string; id: number }, { fetch }) => {
      await fetch(`/api/articles/${encodeURIComponent(slug)}/comments/${id}`, {
        method: "DELETE",
      });
    }
  );

  const doDelete = async () =>
    await deleteAction({ slug: params.slug, id: props.id });

  return (
    <div class="card">
      <div class="card-block">
        <p class="card-text">{props.body}</p>
      </div>
      <div class="card-footer">
        <A
          href={`/profile/${encodeURIComponent(props.author.username)}`}
          class="comment-author"
        >
          <img
            src={props.author.image}
            alt={props.author.username}
            class="comment-author-img"
          />
        </A>
        &nbsp;
        <A
          href={`/profile/${encodeURIComponent(props.author.username)}`}
          class="comment-author"
        >
          {props.author.username}
        </A>
        <span class="date-posted">{postedAt()}</span>
        <Show when={canModify()}>
          <span class="mod-options">
            <button
              onClick={doDelete}
              class="ion-trash-a"
              style={{
                appearance: "none",
                "background-color": "transparent",
                border: 0,
                padding: 0,
              }}
              disabled={deleting.pending}
            />
          </span>
        </Show>
      </div>
    </div>
  );
};

export default Comment;
