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
  createRouteData,
  useRouteData,
  useSearchParams,
  useLocation,
  Title,
  A,
} from "solid-start";

import type { MultipleArticles } from "~/types/api";
import { useSession } from "~/lib/session";
import Banner from "~/components/home/Banner";
import ArticlePreviews from "~/components/article/ArticlePreviews";
import ArticlePreview from "~/components/article/ArticlePreview";
import Sidebar from "~/components/home/Sidebar";

type Feed = "global" | "your";

// TODO: pagination

export function routeData({ location, navigate }: RouteDataArgs) {
  return createRouteData(
    async ([hash, tag, navigate], { fetch }) => {
      const feed = hash.substring(1) as Feed;

      console.log("routeData.feed = ", feed);

      let url: string;
      if (feed === "global") {
        url = tag
          ? `/api/articles?tag=${encodeURIComponent(tag)}`
          : "/api/articles";
      } else if (feed === "your") {
        url = "/api/articles/feed";
      } else {
        throw navigate("/");
      }

      const res = await fetch(url, {});
      const multipleArticles = (await res.json()) as MultipleArticles;

      return multipleArticles.articles;
    },
    {
      key: () =>
        [
          (location.hash || "#global") as `#${Feed}`,
          location.query.tag,
          navigate,
        ] as const,
    }
  );
}

const HomePage: VoidComponent = () => {
  const articles = useRouteData<typeof routeData>();

  const session = useSession();
  const user = () => session()?.user;

  const [searchParams] = useSearchParams<{ tag?: string }>();
  const tag = () => searchParams.tag;

  const location = useLocation();
  const [feed, setFeed] = createSignal<Feed>("global");

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
                <Show when={user()}>
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
              <ArticlePreviews articles={articles() ?? []} />
              {/* TODO: decide which to use depending on having to pass key to ArticlePreview */}
              {/* <For each={articles() ?? []} fallback="Nothing to see here...">
                {(article) => <ArticlePreview {...article} />}
              </For> */}
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
