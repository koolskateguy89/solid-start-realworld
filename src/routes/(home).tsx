import { type VoidComponent, createSignal, Show, Suspense } from "solid-js";
import {
  type RouteDataArgs,
  createRouteData,
  useRouteData,
  useSearchParams,
  Title,
  A,
} from "solid-start";

import type { MultipleArticles } from "~/types/api";
import Banner from "~/components/home/Banner";
import Sidebar from "~/components/home/Sidebar";
import Articles from "~/components/article/Articles";

export function routeData({ location }: RouteDataArgs) {
  return createRouteData(
    async (tag, { fetch }) => {
      const url = tag ? `/api/articles?tag=${tag}` : "/api/articles";

      const res = await fetch(url, {});
      const multipleArticles = (await res.json()) as MultipleArticles;

      // TODO: global feed vs your feed, could use query param, idrk

      return multipleArticles.articles;
    },
    {
      // using default "" because it won't run if tag is undefined
      key: () => location.query.tag ?? "",
    }
  );
}

const HomePage: VoidComponent = () => {
  const articles = useRouteData<typeof routeData>();

  // TODO: impl feed toggle thingy

  const [searchParams] = useSearchParams<{ tag?: string }>();

  const tag = () => searchParams.tag;

  // TODO: only global if not logged in? or empty?
  const [feed, setFeed] = createSignal<"global" | "your">("global");

  return (
    <main class="home-page">
      <Title>Home — Conduit</Title>

      <pre>searchParams = {JSON.stringify(searchParams)}</pre>
      <Banner />

      <div class="container page">
        <div class="row">
          <div class="col-md-9">
            <div class="feed-toggle">
              <ul class="nav nav-pills outline-active">
                <li class="nav-item">
                  {/* TODO? class disabled when not signed in */}
                  <A
                    href="/"
                    activeClass=""
                    classList={{
                      "nav-link": true,
                      active: !tag() && feed() === "your",
                    }}
                    onClick={() => setFeed("your")}
                  >
                    Your Feed
                  </A>
                </li>
                <li class="nav-item">
                  <A
                    href="/"
                    activeClass=""
                    classList={{
                      "nav-link": true,
                      active: !tag() && feed() === "global",
                    }}
                    onClick={() => setFeed("global")}
                  >
                    Global Feed
                  </A>
                </li>
                <Show when={tag()}>
                  <li class="nav-item">
                    <div class="nav-link active">
                      <i class="ion-pound" /> {tag()}
                    </div>
                  </li>
                </Show>
              </ul>
            </div>

            <Suspense fallback="Loading articles...">
              <Show
                when={(articles() ?? []).length > 0}
                fallback="Nothing to see here..."
              >
                <Articles articles={articles()!} />
              </Show>
            </Suspense>
          </div>

          <div class="col-md-3">
            <Sidebar />
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
