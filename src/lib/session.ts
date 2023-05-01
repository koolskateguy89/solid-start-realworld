import { createServerData$ } from "solid-start/server";

import type { SessionProfile } from "~/server/lib/auth";
import { getUserProfile } from "~/server/lib/session";

export type Session = {
  user: SessionProfile | null;
};

// Taken inspiration from NextAuth's useSession hook

export function useSession() {
  return createServerData$(
    async (_, { request }) => {
      const user = await getUserProfile(request);

      const session: Session = { user };

      return session;
    },
    {
      key: "session",
    }
  );
}
