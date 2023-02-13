import { createRouteAction } from "solid-start";

import type { Options } from ".";

// POST/DELETE /api/articles/:slug/favorite

export function createFavoriteAction(options?: Options) {
  return createRouteAction(async (slug: string, { fetch }) => {
    await fetch(`/api/articles/${encodeURIComponent(slug)}/favorite`, {
      method: "POST",
    });
  }, options);
}

export function createUnfavoriteAction(options?: Options) {
  return createRouteAction(async (slug: string, { fetch }) => {
    await fetch(`/api/articles/${encodeURIComponent(slug)}/favorite`, {
      method: "DELETE",
    });
  }, options);
}
