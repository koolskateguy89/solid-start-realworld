import { createRouteAction } from "solid-start";

import type { ActionOptions } from ".";

// POST/DELETE /api/articles/:slug/favorite

export function createFavoriteAction(options?: ActionOptions) {
  return createRouteAction(async (slug: string, { fetch }) => {
    await fetch(`/api/articles/${encodeURIComponent(slug)}/favorite`, {
      method: "POST",
    });
  }, options);
}

export function createUnfavoriteAction(options?: ActionOptions) {
  return createRouteAction(async (slug: string, { fetch }) => {
    await fetch(`/api/articles/${encodeURIComponent(slug)}/favorite`, {
      method: "DELETE",
    });
  }, options);
}
