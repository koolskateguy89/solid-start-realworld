import { type VoidComponent } from "solid-js";
import { createRouteAction, Title } from "solid-start";
import { createServerData$, redirect } from "solid-start/server";

import { requireUser } from "~/server/lib/session";
import type { CreateArticleBody } from "~/routes/api/articles/(list-create)";
import type { Article } from "~/types/api";

export function routeData() {
  return createServerData$(async (_, { request }) => {
    await requireUser(request);
  });
}

const CreateArticlePage: VoidComponent = () => {
  const [creating, { Form }] = createRouteAction(
    async (formData: FormData, { fetch }) => {
      const body: CreateArticleBody = {
        article: {
          title: formData.get("title") as string,
          description: formData.get("description") as string,
          body: formData.get("body") as string,
          tagList: (formData.get("tagList") as string)
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        },
      };

      const res = await fetch("/api/articles", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const article = (await res.json()) as Article;
      // redirect to article page
      return redirect(`/article/${encodeURIComponent(article.slug)}`);
    }
  );

  return (
    <div class="editor-page">
      <Title>Editor — Conduit</Title>
      <main class="container page">
        <div class="row">
          <div class="col-md-10 offset-md-1 col-xs-12">
            <Form>
              <fieldset>
                <fieldset class="form-group">
                  <input
                    type="text"
                    name="title"
                    placeholder="Article Title"
                    pattern="[a-zA-Z0-9 ]+" // only allow alphanumeric characters and spaces
                    class="form-control form-control-lg"
                    required
                  />
                </fieldset>
                <fieldset class="form-group">
                  <input
                    type="text"
                    name="description"
                    placeholder="What's this article about?"
                    class="form-control"
                    required
                  />
                </fieldset>
                <fieldset class="form-group">
                  <textarea
                    name="body"
                    placeholder="Write your article (in markdown)"
                    rows="8"
                    class="form-control"
                    required
                  />
                </fieldset>
                <fieldset class="form-group">
                  <input
                    name="tagList"
                    type="text"
                    placeholder="Enter tags (comma delimited)"
                    class="form-control"
                    required
                  />
                  <div class="tag-list" />
                </fieldset>
                <button
                  type="submit"
                  class="btn btn-lg pull-xs-right btn-primary"
                  disabled={creating.pending}
                >
                  Publish Article
                </button>
              </fieldset>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateArticlePage;
