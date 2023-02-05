import type { VoidComponent } from "solid-js";
import { Show } from "solid-js";
import { A } from "solid-start";

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

  const deleteComment = () => {
    // TODO: action
    console.log("delete comment");
  };

  // TODO:
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
          <button type="button" onClick={deleteComment} class="mod-options">
            <i class="ion-trash-a" />
          </button>
        </Show>
      </div>
    </div>
  );
};

export default Comment;
