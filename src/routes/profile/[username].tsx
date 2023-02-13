import { type RouteDataArgs, redirect, Outlet } from "solid-start";
import { createServerData$ } from "solid-start/server";

import type { Profile } from "~/types/api";

export function routeData({ params }: RouteDataArgs) {
  const profile = createServerData$(
    async (username, { fetch, request }) => {
      const res = await fetch(`/api/profiles/${encodeURIComponent(username)}`, {
        headers: request.headers,
      });

      if (!res.ok) throw redirect("/");

      return (await res.json()) as Profile;
    },
    {
      key: () => params.username,
    }
  );

  return { profile };
}

export default Outlet;
