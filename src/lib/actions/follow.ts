import { createRouteAction } from "solid-start";

import type { Options } from ".";

// POST/DELETE /api/profiles/:username/follow

export function createFollowAction(options?: Options) {
  return createRouteAction(async (username: string, { fetch }) => {
    await fetch(`/api/profiles/${encodeURIComponent(username)}/follow`, {
      method: "POST",
    });
  }, options);
}

export function createUnfollowAction(options?: Options) {
  return createRouteAction(async (username: string, { fetch }) => {
    await fetch(`/api/profiles/${encodeURIComponent(username)}/follow`, {
      method: "DELETE",
    });
  }, options);
}
