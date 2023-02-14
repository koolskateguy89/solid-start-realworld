import {
  type VoidComponent,
  createEffect,
  createSignal,
  For,
  Show,
  Suspense,
} from "solid-js";
import {
  type RouteDataArgs,
  useRouteData,
  useSearchParams,
  useLocation,
  Title,
  A,
} from "solid-start";
import { createServerData$, redirect } from "solid-start/server";

import type { MultipleArticles } from "~/types/api";
import { useSession } from "~/lib/session";
import Banner from "~/components/home/Banner";
import ArticlePreview from "~/components/article/ArticlePreview";
import Pagination from "~/components/home/Pagination";
import Sidebar from "~/components/home/Sidebar";

type Feed = "global" | "your";

export function routeData({ location }: RouteDataArgs) {
  return createServerData$(
    async ([hash, tag, page], { fetch, request }) => {
      const searchParams = new URLSearchParams();

      const feed = hash.substring(1) as Feed;

      console.log("routeData.feed =", feed);

      let url: string;
      if (feed === "global") {
        if (tag) searchParams.set("tag", tag);

        url = "/api/articles";
      } else if (feed === "your") {
        url = "/api/articles/feed";
      } else {
        throw redirect("/");
      }

      if (page) {
        let pageNum = parseInt(page) || 1;
        if (pageNum < 1) pageNum = 1;

        const offset = (pageNum - 1) * 20;

        searchParams.set("offset", offset.toString());
      }

      url += `?${searchParams}`;

      const res = await fetch(url, {
        headers: request.headers,
      });

      const { articles } = (await res.json()) as MultipleArticles;
      return articles;
    },
    {
      key: () =>
        [
          (location.hash || "#global") as `#${Feed}`,
          location.query.tag,
          location.query.page,
        ] as const,
    }
  );
}

const HomePage: VoidComponent = () => {
  const articles = useRouteData<typeof routeData>();

  const session = useSession();
  const isLoggedIn = () => Boolean(session()?.user);

  const [searchParams] = useSearchParams<{ tag?: string }>();
  const tag = () => searchParams.tag;

  const location = useLocation();
  const [feed, setFeed] = createSignal<Feed>("global");

  const invalidationKey = () => [location.hash || "#global", tag()];

  // can't derive feed from location.hash because hash isn't
  // set on initial render
  createEffect(() => {
    setFeed((location.hash.substring(1) || "global") as Feed);
  });

  return (
    <main class="home-page">
      <Title>Home — Conduit</Title>
      <Banner />

      <div class="container page">
        <div class="row">
          <div class="col-md-9">
            <div class="feed-toggle">
              <ul class="nav nav-pills outline-active">
                <Show when={isLoggedIn()}>
                  <li class="nav-item">
                    <A
                      href="/#your"
                      activeClass=""
                      classList={{
                        "nav-link": true,
                        active: !tag() && feed() === "your",
                      }}
                    >
                      Your Feed
                    </A>
                  </li>
                </Show>
                <li class="nav-item">
                  <A
                    href="/"
                    activeClass=""
                    classList={{
                      "nav-link": true,
                      active: !tag() && feed() === "global",
                    }}
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
              <For each={articles()} fallback="Nothing to see here...">
                {(article) => (
                  <ArticlePreview {...article} invalidate={invalidationKey()} />
                )}
              </For>

              {/* TODO: get totalPages from API somehow */}
              <Pagination totalPages={20} />
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
