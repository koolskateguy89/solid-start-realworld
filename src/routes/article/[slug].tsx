import { type VoidComponent, Show, Suspense } from "solid-js";
import {
  type RouteDataArgs,
  createRouteAction,
  createRouteData,
  redirect,
  useRouteData,
  useParams,
  refetchRouteData,
  Title,
} from "solid-start";

import ArticleActions from "~/components/article/ArticleActions";
import ArticleContent from "~/components/article/ArticleContent";
import ArticleMeta from "~/components/article/ArticleMeta";
import CommentForm from "~/components/comment/CommentForm";
import CommentList from "~/components/comment/CommentList";
import type { Article, MultipleComments } from "~/types/api";

export function routeData({ params }: RouteDataArgs) {
  const article = createRouteData(
    async ([, slug], { fetch }) => {
      const res = await fetch(`/api/articles/${encodeURIComponent(slug!)}`, {});

      if (!res.ok) {
        throw redirect("/");
      }

      return (await res.json()) as Article;
    },
    {
      key: () => ["article", params.slug],
    }
  );

  const comments = createRouteData(
    async ([, slug], { fetch }) => {
      const res = await fetch(
        `/api/articles/${encodeURIComponent(slug!)}/comments`,
        {}
      );

      if (!res.ok) {
        throw redirect("/");
      }

      const result = (await res.json()) as MultipleComments;

      console.log("result =", result);

      return result.comments;
    },
    {
      key: () => ["comments", params.slug],
    }
  );

  return {
    article,
    comments,
  };
}

// might have to handle comment state here and pass it down to CommentList
// cos will need to update the list when a comment is added & deleted
// but maybe that's not necessary, can just refetch the comments
// but that's not ideal either, cos it'll cause a flash of loading (it might not cos of
// how Solid works - maybe test)

// refetching is the easiest way to do it

const ArticlePage: VoidComponent = () => {
  const { article, comments } = useRouteData<typeof routeData>();

  const params = useParams<{ slug: string }>();

  const [deleting, deleteAction] = createRouteAction(
    async (id: number, { fetch }) => {
      const res = await fetch(
        `/api/articles/${encodeURIComponent(params.slug)}/comments/${id}`,
        {
          method: "DELETE",
        }
      );

      console.log("res =", res);
    }
  );

  const onDelete = async (id: number) => {
    console.log("delete comment");
    await deleteAction(id);
    // TODO: uncomment this once we have comments seeded
    // await refetchRouteData(["comments", params.slug]);
  };

  return (
    <Suspense>
      <Show when={article()} keyed>
        {(article) => (
          <main class="article-page">
            <Title>{article.title} — Conduit</Title>

            <div class="banner">
              <div class="container">
                <h1>{article.title}</h1>
                <ArticleMeta {...article} />
              </div>
            </div>

            <div class="container page">
              {/* TODO: markdown or smthn */}
              <ArticleContent>
                <p>
                  Web development technologies have evolved at an incredible
                  clip over the past few years.
                </p>
                <h2 id="introducing-ionic">Introducing RealWorld.</h2>
                <p>
                  It's a great solution for learning how other frameworks work.
                </p>
              </ArticleContent>

              <hr />

              <ArticleActions {...article} />

              <div class="row">
                <div class="col-xs-12 col-md-8 offset-md-2">
                  <CommentForm />

                  <pre>comments = {JSON.stringify(comments(), null, 2)}</pre>

                  <CommentList
                    comments={
                      // comments() ||
                      [
                        {
                          id: 1,
                          createdAt: "2020-01-20T08:02:17.819Z",
                          body: "This is a comment",
                          author: {
                            username: "jake",
                            image: "https://i.stack.imgur.com/xHWG8.jpg",
                          },
                        },
                        {
                          id: 2,
                          createdAt: "2020-01-20T08:02:17.819Z",
                          body: "Another comment",
                          author: {
                            username: "test",
                            image: "https://i.stack.imgur.com/xHWG8.jpg",
                          },
                        },
                      ]
                    }
                    onDelete={onDelete}
                  />

                  {/* TODO: remove once some comments have been added */}
                  <div class="card">
                    <div class="card-block">
                      <p class="card-text">
                        With supporting text below as a natural lead-in to
                        additional content.
                      </p>
                    </div>
                    <div class="card-footer">
                      <a href="aaaaaaaaa" class="comment-author">
                        <img
                          src="http://i.imgur.com/Qr71crq.jpg"
                          alt="aaaaaaaa"
                          class="comment-author-img"
                        />
                      </a>
                      &nbsp;
                      <a href="aaaaaaaaaaaaa" class="comment-author">
                        Jacob Schmidt
                      </a>
                      <span class="date-posted">Dec 29th</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}
      </Show>
    </Suspense>
  );
};

export default ArticlePage;
