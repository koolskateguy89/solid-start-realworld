import {
  type ParentComponent,
  createContext,
  createResource,
  useContext,
} from "solid-js";
import { createServerData$ } from "solid-start/server";

import { type SessionProfile, getUserProfile } from "~/server/lib/session";

// Had to use a separate file for client-side function(s) because when
// importing `useSession` from 'lib/session.server', it would try to
// import serverEnv which would fail on the client

export type Session = {
  user: SessionProfile | null;
};

// TODO!: find better way to share session between client and server
// because as it is, it makes loads of requests to the server
// export function useSession() {
//   return createServerData$(async (_, { request }) => {
//     const user = await getUserProfile(request);

//     return { user };
//   });
// }

// would be better if could load it in like root component
// and store it in a store/context

// i wanna take inspiration from next-auth's solidstart useSession

//
// This mostly works, but it's kinda finnicky (I think)

function createSession() {
  return createServerData$(
    async (_, { request }) => {
      const user = await getUserProfile(request);

      const session: Session = { user };

      return session;
    },
    {
      // key: "session",
    }
  );
}

const SessionContext = createContext<ReturnType<typeof createSession>>();

// it's really annoying that `createServerData$` can return `undefined`
// because then i have to do this so the `useSession` hook doesn't
// return `undefined` when it's not loaded yet, instead it returns
// a resource with `undefined` as the value
const [emptySession] = createResource<Session | undefined>(() => undefined);

export const useSession = () => useContext(SessionContext) ?? emptySession;

export const SessionProvider: ParentComponent = (props) => {
  const session = createSession();

  return (
    <SessionContext.Provider value={session}>
      {props.children}
    </SessionContext.Provider>
  );
};
