import { type VoidComponent, Suspense, For } from "solid-js";
import {
  type RouteDataArgs,
  redirect,
  useRouteData,
  useParams,
} from "solid-start";
import { createServerData$ } from "solid-start/server";

import type { MultipleArticles } from "~/types/api";
import ArticlePreview from "~/components/article/ArticlePreview";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(
    async ([, username], { fetch, request }) => {
      // /favorites is the same but with favorited=${username} instead of author=${username}
      const res = await fetch(
        `/api/articles?author=${encodeURIComponent(username)}`,
        { headers: request.headers }
      );

      if (!res.ok) throw redirect("/");

      const { articles } = (await res.json()) as MultipleArticles;
      return articles;
    },
    {
      key: () => ["articles", params.username!] as const,
    }
  );
}

const ProfilePage: VoidComponent = () => {
  const articles = useRouteData<typeof routeData>();

  const params = useParams<{ username: string }>();

  return (
    <Suspense fallback="Loading articles...">
      <For each={articles()} fallback="Nothing to see here...">
        {(article) => (
          <ArticlePreview
            {...article}
            invalidate={["articles", params.username]}
          />
        )}
      </For>
    </Suspense>
  );
};

export default ProfilePage;
