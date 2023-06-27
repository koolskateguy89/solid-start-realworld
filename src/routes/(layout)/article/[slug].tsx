import { type VoidComponent, Show, Suspense, For } from "solid-js";
import { type RouteDataArgs, useRouteData, Title } from "solid-start";

import { api } from "~/lib/api";
import ArticleContent from "~/components/article/ArticleContent";
import ArticleMeta from "~/components/article/ArticleMeta";
import Comment from "~/components/comment/Comment";
import NewCommentForm from "~/components/comment/NewCommentForm";

export function routeData({ params }: RouteDataArgs) {
  const article = api.articles.getArticle(params.slug!);
  const comments = api.articles.getComments(params.slug!);

  return {
    article,
    comments,
  };
}

// There's no need to manually refetch comments after a comment is added or
// deleted, it is updated automatically by invalidating the comments resource.
// https://start.solidjs.com/api/createRouteAction#invalidating-specific-data-after-an-action

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
              <ArticleContent>{article.body}</ArticleContent>

              <hr />

              <div class="article-actions">
                <ArticleMeta {...article} />
              </div>

              <div class="row">
                <div class="col-xs-12 col-md-8 offset-md-2">
                  <NewCommentForm />

                  <For each={comments()}>
                    {(comment) => <Comment {...comment} />}
                  </For>
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
