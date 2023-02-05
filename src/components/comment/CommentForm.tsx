import type { VoidComponent } from "solid-js";
import { useSession } from "~/lib/session";

// TODO: action

// TODO
const CommentForm: VoidComponent = () => {
  const session = useSession();
  const user = () => session()?.user;

  return (
    <form class="card comment-form">
      <div class="card-block">
        <textarea
          name="body"
          class="form-control"
          placeholder="Write a comment..."
          rows="3"
        />
      </div>
      <div class="card-footer">
        <img
          src={user()?.image ?? ""}
          alt={user()?.username ?? "Author"}
          class="comment-author-img"
        />
        <button type="button" class="btn btn-sm btn-primary">
          Post Comment
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
