import { type VoidComponent, Suspense, For } from "solid-js";
import {
  type RouteDataArgs,
  redirect,
  useRouteData,
  useParams,
  Title,
  A,
} from "solid-start";
import { createServerData$ } from "solid-start/server";

import type { routeData as profileRouteData } from "../[username]";
import type { MultipleArticles } from "~/types/api";
import ArticlePreview from "~/components/article/ArticlePreview";
import UserInfo from "~/components/profile/UserInfo";

export function routeData({
  params,
  data: { profile },
}: RouteDataArgs<typeof profileRouteData>) {
  const articles = createServerData$(
    async ([, username], { fetch, request }) => {
      const res = await fetch(
        `/api/articles?favorited=${encodeURIComponent(username)}`,
        { headers: request.headers }
      );

      if (!res.ok) throw redirect("/");

      const multipleArticles = (await res.json()) as MultipleArticles;

      return multipleArticles.articles;
    },
    {
      key: () => ["articles", params.username!] as const,
    }
  );

  return { profile, articles };
}

// TODO: use [username].tsx to define layout not just data
const FavoritesPage: VoidComponent = () => {
  const { profile, articles } = useRouteData<typeof routeData>();

  const params = useParams<{ username: string }>();

  return (
    <main class="profile-page">
      <Title>{profile()?.username ?? "Profile"} — Conduit</Title>

      <UserInfo {...profile()!} />

      <div class="container">
        <div class="row">
          <div class="col-xs-12 col-md-10 offset-md-1">
            <div class="articles-toggle">
              <ul class="nav nav-pills outline-active">
                <li class="nav-item">
                  <A href=".." class="nav-link">
                    My Articles
                  </A>
                </li>
                <li class="nav-item">
                  <div class="nav-link active">Favorited Articles</div>
                </li>
              </ul>
            </div>

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
          </div>
        </div>
      </div>
    </main>
  );
};

export default FavoritesPage;
