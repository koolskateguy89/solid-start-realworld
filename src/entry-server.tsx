import { json, redirect } from "solid-start";
import {
  createHandler,
  renderAsync,
  StartServer,
} from "solid-start/entry-server";

import { protectedPages, protectedApiRoutes } from "~/config/routes";
import { getUserProfile as getUserForPage } from "~/server/lib/session";
import { getUser as getUserForApiRoute } from "~/server/lib/auth";
import type { ErrorResponse } from "~/types/api";

export default createHandler(
  // Middleware for protected routes
  ({ forward }) => {
    return async (event) => {
      const pathname = new URL(event.request.url).pathname;

      if (protectedPages.includes(pathname)) {
        const user = await getUserForPage(event.request);

        if (!user) return redirect("/login");
      } else if (protectedApiRoutes.includes(pathname)) {
        const user = await getUserForApiRoute(event.request);

        if (!user) return json<ErrorResponse>({ errors: "Unauthorised!" }, 401);
      }

      return forward(event);
    };
  },
  renderAsync((event) => <StartServer event={event} />)
);
