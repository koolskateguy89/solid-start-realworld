import { createSignal } from "solid-js";
import { createServerData$ } from "solid-start/server";

import { type SessionProfile, getUserProfile } from "~/server/lib/session";

// Had to use a separate file for client-side function(s) because when
// importing `useSession` from 'lib/session.server', it would try to
// import serverEnv which would fail on the client

export type Session = {
  user: SessionProfile;
};

// TODO?: find better way to share session between client and server
// because as it is, it makes loads of requests to the server
const [session, setSession] = createSignal<Session>();

// would be better if could load it in like root component
// and store it in a store/context

// i wanna take inspiration from next-auth's useSession

export function useSession() {
  return createServerData$(async (_, { request }) => {
    const user = await getUserProfile(request);

    return { user };
  });
}
