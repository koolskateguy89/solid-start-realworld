import {
  type RouteDataArgs,
  createRouteData,
  redirect,
  Outlet,
} from "solid-start";

import type { Profile } from "~/types/api";

export function routeData({ params }: RouteDataArgs) {
  const profile = createRouteData(
    async (username, { fetch }) => {
      const res = await fetch(
        `/api/profiles/${encodeURIComponent(username)}`,
        {}
      );

      if (!res.ok) {
        throw redirect("/");
      }

      return (await res.json()) as Profile;
    },
    {
      key: () => params.username!,
    }
  );

  return { profile };
}

export default Outlet;
