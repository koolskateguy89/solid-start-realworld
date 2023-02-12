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
      // /favorites is the same but with favorited=${username} instead of author=${username}
      const res = await fetch(
        `/api/articles?author=${encodeURIComponent(username)}`,
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

// TODO?: handle favorites in this page, might be able to with shallow routing
// don't think shallow routing is the correct concept, but what we want is
// what Next.Js does with Link's `as` prop
// (shadow routing isn't a thing in solid-start because it doesn't use a vDOM)

// tbh it should be possible with a catch all route that
// only matches if it's "/" or "/favorites"
// but then how would we basically error if it's not one of those two?
// i dont think solid start supports that (basically next.js's notFound
// return value in getServersideProps)

const ProfilePage: VoidComponent = () => {
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
                  <div class="nav-link active">My Articles</div>
                </li>
                <li class="nav-item">
                  <A class="nav-link" href="./favorites">
                    Favorited Articles
                  </A>
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

export default ProfilePage;
