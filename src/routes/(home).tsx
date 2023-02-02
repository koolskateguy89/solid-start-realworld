import { type VoidComponent, createSignal, Show, Suspense } from "solid-js";
import {
  createRouteData,
  useRouteData,
  useSearchParams,
  Head,
  Title,
  A,
} from "solid-start";

import type { MultipleArticles } from "~/types/api";
import Banner from "~/components/home/Banner";
import Sidebar from "~/components/home/Sidebar";
import Articles from "~/components/article/Articles";

export function routeData() {
  const [searchParams] = useSearchParams<{ tag?: string }>();

  return createRouteData(
    async (tag, { fetch }) => {
      // TODO: other search params? dont think so actually for this page
      const url = tag ? `/api/articles?tag=${tag}` : "/api/articles";

      const res = await fetch(url, {});
      const multipleArticles = (await res.json()) as MultipleArticles;

      // TODO: feed global vs your, could use query param

      return multipleArticles.articles;
    },
    {
      key: () => searchParams.tag ?? "",
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
      <Head>
        <Title>Home — Conduit</Title>
      </Head>

      <pre>{JSON.stringify(searchParams)}</pre>

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

            <Suspense>
              <Articles articles={articles() ?? []} />
            </Suspense>

            <div class="article-preview">
              <div class="article-meta">
                <A href="profile.html">
                  <img
                    src="http://i.imgur.com/Qr71crq.jpg"
                    alt="idk i think user profile pic"
                  />
                </A>
                <div class="info">
                  <A href="" class="author">
                    Eric Simons
                  </A>
                  <span class="date">January 20th</span>
                </div>
                <button class="btn btn-outline-primary btn-sm pull-xs-right">
                  <i class="ion-heart" /> 29
                </button>
              </div>
              <A href="" class="preview-link">
                <h1>How to build webapps that scale</h1>
                <p>This is the description for the post.</p>
                <span>Read more...</span>
              </A>
            </div>

            <div class="article-preview">
              <div class="article-meta">
                <A href="profile.html">
                  <img
                    src="http://i.imgur.com/N4VcUeJ.jpg"
                    alt="idk i think author profile pic"
                  />
                </A>
                <div class="info">
                  <A href="" class="author">
                    Albert Pai
                  </A>
                  <span class="date">January 20th</span>
                </div>
                <button class="btn btn-outline-primary btn-sm pull-xs-right">
                  <i class="ion-heart" /> 32
                </button>
              </div>
              <A href="" class="preview-link">
                <h1>
                  The song you won't ever stop singing. No matter how hard you
                  try.
                </h1>
                <p>This is the description for the post.</p>
                <span>Read more...</span>
              </A>
            </div>
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
