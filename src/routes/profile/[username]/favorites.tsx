import { type VoidComponent, Show, Suspense } from "solid-js";
import {
  type RouteDataArgs,
  createRouteData,
  redirect,
  useRouteData,
  Title,
  A,
} from "solid-start";

import type { routeData as profileRouteData } from "../[username]";
import type { MultipleArticles } from "~/types/api";
import ArticlePreviews from "~/components/article/ArticlePreviews";
import UserInfo from "~/components/profile/UserInfo";

export function routeData({
  params,
  data: { profile },
}: RouteDataArgs<typeof profileRouteData>) {
  const articles = createRouteData(
    async ([, username], { fetch }) => {
      const res = await fetch(
        `/api/articles?favorited=${encodeURIComponent(username)}`,
        {}
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
              <Show
                when={(articles() ?? []).length > 0}
                fallback="No articles are here... yet."
              >
                <ArticlePreviews articles={articles()!} />
              </Show>
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
};

export default FavoritesPage;
