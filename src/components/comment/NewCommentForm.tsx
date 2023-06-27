import { type VoidComponent, Show, createEffect } from "solid-js";
import { createRouteAction, useParams, A } from "solid-start";

import type { CreateCommentBody } from "~/routes/api/articles/[slug]/comments/(comment)";
import type { Comment } from "~/types/api";
import { useSession } from "~/lib/session";
import ErrorsList from "~/components/user/ErrorsList";
import ImagePlaceholder from "~/components/common/ImagePlaceholder";

const NewCommentForm: VoidComponent = () => {
  const session = useSession();
  const user = () => session()?.user;

  const params = useParams<{ slug: string }>();

  const [posting, { Form }] = createRouteAction(
    async (formData: FormData, { fetch }) => {
      const slug = formData.get("slug") as string;

      const body: CreateCommentBody = {
        comment: {
          body: formData.get("body") as string,
        },
      };

      const res = await fetch(
        `/api/articles/${encodeURIComponent(slug)}/comments`,
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) throw ["Invalid comment"];

      return (await res.json()) as Comment;
    },
    {
      invalidate: ["comments", params.slug],
    }
  );

  let formElem: HTMLFormElement;
  createEffect(() => {
    // clear form on success
    if (posting.result) {
      formElem.reset();
    }
  });

  return (
    <Show
      when={user()}
      fallback={
        <p>
          <A href="/login">Sign in</A> or <A href="/register">sign up</A> to add
          comments on this article.
        </p>
      }
      keyed
    >
      {(user) => (
        <>
          <ErrorsList errors={posting.error} />

          <Form ref={formElem} class="card comment-form">
            <input type="hidden" name="slug" value={params.slug} />
            <div class="card-block">
              <textarea
                name="body"
                class="form-control"
                placeholder="Write a comment..."
                rows="3"
                required
              />
            </div>
            <div class="card-footer">
              <img
                src={user.image}
                alt={user.username}
                class="comment-author-img"
              />
              <button
                type="submit"
                class="btn btn-sm btn-primary"
                disabled={posting.pending}
              >
                Post Comment
              </button>
            </div>
          </Form>
        </>
      )}
    </Show>
  );
};

export default NewCommentForm;

export const NewCommentFormSkeleton: VoidComponent = () => (
  <form class="card comment-form">
    <div class="card-block">
      <textarea
        name="body"
        class="form-control"
        placeholder="Loading comments..."
        rows="3"
        required
      />
    </div>
    <div class="card-footer">
      <ImagePlaceholder class="comment-author-img" />
      <button type="submit" class="btn btn-sm btn-primary" disabled>
        Post Comment
      </button>
    </div>
  </form>
);
