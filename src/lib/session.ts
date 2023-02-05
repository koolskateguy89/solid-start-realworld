import { createServerData$ } from "solid-start/server";

import { getUserProfile } from "~/server/lib/session";

// Had to use a separate file for client-side function(s) because when
// importing `useSession` from 'lib/session.server', it would try to
// import serverEnv which would fail on the client

export function useSession() {
  return createServerData$(async (_, { request }) => {
    const user = await getUserProfile(request);

    return { user };
  });
}
