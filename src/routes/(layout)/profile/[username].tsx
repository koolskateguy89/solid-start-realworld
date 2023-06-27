import { Show } from "solid-js";
import type { VoidComponent } from "solid-js";
import {
  type RouteDataArgs,
  redirect,
  useRouteData,
  Title,
  A,
  Outlet,
} from "solid-start";
import { createServerData$ } from "solid-start/server";

import type { Profile } from "~/types/api";
import UserInfo from "~/components/profile/UserInfo";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(
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
}

const ProfilePageLayout: VoidComponent = () => {
  const profile = useRouteData<typeof routeData>();

  return (
    <Show when={profile()}>
      {(profile) => (
        <main class="profile-page">
          <Title>{profile().username} — Conduit</Title>

          <UserInfo {...profile()} />

          <div class="container">
            <div class="row">
              <div class="col-xs-12 col-md-10 offset-md-1">
                <div class="articles-toggle">
                  <ul class="nav nav-pills outline-active">
                    <li class="nav-item">
                      <A
                        href={`/profile/${profile().username}`}
                        class="nav-link"
                        end
                      >
                        My Articles
                      </A>
                    </li>
                    <li class="nav-item">
                      <A
                        href={`/profile/${profile().username}/favorites`}
                        class="nav-link"
                      >
                        Favorited Articles
                      </A>
                    </li>
                  </ul>
                </div>

                <Outlet />
              </div>
            </div>
          </div>
        </main>
      )}
    </Show>
  );
};

export default ProfilePageLayout;
