import { type VoidComponent, Show, Suspense, For } from "solid-js";
import { type RouteDataArgs, useRouteData, Title } from "solid-start";

import { api } from "~/lib/api";
import ArticleContent from "~/components/article/ArticleContent";
import ArticleMeta, {
  ArticleMetaSkeleton,
} from "~/components/article/ArticleMeta";
import Comment from "~/components/comment/Comment";
import NewCommentForm, {
  NewCommentFormSkeleton,
} from "~/components/comment/NewCommentForm";
import ArticleBanner, {
  ArticleBannerSkeleton,
} from "~/components/article/ArticleBanner";

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
    <main class="article-page">
      <Suspense
        fallback={
          <>
            <Title>Conduit</Title>
            <ArticleBannerSkeleton />
          </>
        }
      >
        <Show when={article()} keyed>
          {(article) => (
            <>
              <Title>{article.title} — Conduit</Title>
              <ArticleBanner {...article} />
            </>
          )}
        </Show>
      </Suspense>

      <div class="container page">
        <Suspense
          fallback={
            <>
              <hr />
              <div class="article-actions">
                <ArticleMetaSkeleton />
              </div>
            </>
          }
        >
          <Show when={article()} keyed>
            {(article) => (
              <>
                <ArticleContent>{article.body}</ArticleContent>

                <hr />

                <div class="article-actions">
                  <ArticleMeta {...article} />
                </div>
              </>
            )}
          </Show>
        </Suspense>

        <div class="row">
          <div class="col-xs-12 col-md-8 offset-md-2">
            <Suspense fallback={<NewCommentFormSkeleton />}>
              <NewCommentForm />

              <For each={comments()}>
                {(comment) => <Comment {...comment} />}
              </For>
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ArticlePage;
