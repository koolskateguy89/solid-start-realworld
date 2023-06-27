import { createRouteData, redirect } from "solid-start";
import { createServerData$ } from "solid-start/server";

import type { Article, MultipleComments } from "~/types/api";

// TODO? might want to not make these encapsulate the entire create_x_Data
// because that doesn't allow the consumer to use the data in other ways
// e.g. in editor we only want to allow the user to edit their own articles
// so might have to make these just return the data, and have the consumer
// do the rest themselves. (will need to pass fetcher into this)

// TODO: getArticles(filters)

export function getArticle(slug: string) {
  return createServerData$(
    async ([, slug], { fetch, request }) => {
      const res = await fetch(`/api/articles/${encodeURIComponent(slug)}`, {
        headers: request.headers,
      });

      if (!res.ok) throw redirect("/");

      return (await res.json()) as Article;
    },
    {
      key: () => ["article", slug] as const,
    }
  );
}

export function getComments(slug: string) {
  return createRouteData(
    async ([, slug], { fetch }) => {
      const res = await fetch(
        `/api/articles/${encodeURIComponent(slug)}/comments`,
        {}
      );

      if (!res.ok) {
        throw redirect("/");
      }

      const { comments } = (await res.json()) as MultipleComments;
      return comments;
    },
    {
      key: () => ["comments", slug] as const,
    }
  );
}
