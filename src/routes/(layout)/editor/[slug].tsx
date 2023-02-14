import { type VoidComponent, Suspense, Show } from "solid-js";
import {
  type APIEvent,
  createRouteAction,
  useParams,
  useRouteData,
  Title,
} from "solid-start";
import { createServerData$, redirect } from "solid-start/server";

import { getUserProfile } from "~/server/lib/session";
import type { Article } from "~/types/api";
import type {
  UpdateArticleBody,
  UpdateArticleError,
} from "~/routes/api/articles/[slug]/(article)";
import ErrorsList from "~/components/user/ErrorsList";

export function routeData({ params }: APIEvent) {
  return createServerData$(
    async (slug, { fetch, request }) => {
      const user = await getUserProfile(request);

      const res = await fetch(`/api/articles/${encodeURIComponent(slug)}`, {});
      if (!res.ok) throw redirect("/");

      const article = (await res.json()) as Article;

      // only show this page to the author of the article
      if (user?.username !== article.author.username)
        throw redirect(`/article/${encodeURIComponent(slug)}`);

      return article;
    },
    {
      key: () => params.slug,
    }
  );
}

const EditArticlePage: VoidComponent = () => {
  const article = useRouteData<typeof routeData>();

  const params = useParams<{ slug: string }>();

  const [updating, { Form }] = createRouteAction(
    async (formData: FormData, { fetch }) => {
      const body: UpdateArticleBody = {
        article: {
          title: formData.get("title") as string,
          description: formData.get("description") as string,
          body: formData.get("body") as string,
        },
      };

      const slug = formData.get("slug") as string;

      const res = await fetch(`/api/articles/${encodeURIComponent(slug)}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const { errors } = (await res.json()) as UpdateArticleError;

        if (errors === "slug-taken")
          throw [
            "You cannot use this title as it does not generate a unique slug",
          ];
        else throw [errors];
      }

      const article = (await res.json()) as Article;
      // redirect to article page
      return redirect(`/article/${encodeURIComponent(article.slug)}`);
    }
  );

  return (
    <Suspense>
      <Show when={article()} keyed>
        {(article) => (
          <div class="editor-page">
            <Title>Editor — Conduit</Title>
            <main class="container page">
              <div class="row">
                <div class="col-md-10 offset-md-1 col-xs-12">
                  <ErrorsList errors={updating.error} />

                  <Form>
                    <input type="hidden" name="slug" value={params.slug} />
                    <fieldset>
                      <fieldset class="form-group">
                        <input
                          type="text"
                          name="title"
                          placeholder="Article Title"
                          value={article.title}
                          class="form-control form-control-lg"
                          required
                        />
                      </fieldset>
                      <fieldset class="form-group">
                        <input
                          type="text"
                          name="description"
                          placeholder="What's this article about?"
                          value={article.description}
                          class="form-control"
                          required
                        />
                      </fieldset>
                      <fieldset class="form-group">
                        <textarea
                          name="body"
                          placeholder="Write your article (in markdown)"
                          rows="8"
                          value={article.body}
                          class="form-control"
                          required
                        />
                      </fieldset>
                      <fieldset class="form-group">
                        <input
                          name="tagList"
                          type="text"
                          placeholder="Enter tags"
                          value={article.tagList.join(",")}
                          class="form-control"
                          readOnly
                        />
                        <div class="tag-list" />
                      </fieldset>
                      <button
                        type="submit"
                        class="btn btn-lg pull-xs-right btn-primary"
                        disabled={updating.pending}
                      >
                        Edit Article
                      </button>
                    </fieldset>
                  </Form>
                </div>
              </div>
            </main>
          </div>
        )}
      </Show>
    </Suspense>
  );
};

export default EditArticlePage;
