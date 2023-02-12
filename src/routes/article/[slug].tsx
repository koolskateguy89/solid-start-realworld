import { type VoidComponent, Show, Suspense } from "solid-js";
import {
  type RouteDataArgs,
  createRouteData,
  redirect,
  useRouteData,
  Title,
} from "solid-start";

import ArticleContent from "~/components/article/ArticleContent";
import ArticleMeta from "~/components/article/ArticleMeta";
import CommentList from "~/components/comment/CommentList";
import NewCommentForm from "~/components/comment/NewCommentForm";
import type { Article, MultipleComments } from "~/types/api";

export function routeData({ params }: RouteDataArgs) {
  const article = createRouteData(
    async ([, slug], { fetch }) => {
      const res = await fetch(`/api/articles/${encodeURIComponent(slug!)}`, {});

      if (!res.ok) throw redirect("/");

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

// Idk how it works but there's no need to refetch comments manually whe
// a comment is added or deleted, it just updates automatically after the
// request is made.
// SolidStart is magic.

const ArticlePage: VoidComponent = () => {
  const { article, comments } = useRouteData<typeof routeData>();

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
                {article.body}
                {/* <p>
                  Web development technologies have evolved at an incredible
                  clip over the past few years.
                </p>
                <h2 id="introducing-ionic">Introducing RealWorld.</h2>
                <p>
                  It's a great solution for learning how other frameworks work.
                </p> */}
              </ArticleContent>

              <hr />

              <div class="article-actions">
                <ArticleMeta {...article} />
              </div>

              <div class="row">
                <div class="col-xs-12 col-md-8 offset-md-2">
                  <NewCommentForm slug={article.slug} />

                  <CommentList comments={comments() ?? []} />
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
