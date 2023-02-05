import { type VoidComponent, Suspense } from "solid-js";
import { useRouteData, Title } from "solid-start";
import { createServerAction$, createServerData$ } from "solid-start/server";

import type { User } from "~/types/api";
import { logout, requireUser } from "~/server/lib/session";

export function routeData() {
  return createServerData$(async (_, { fetch, request }) => {
    await requireUser(request);

    const res = await fetch("api/user", {
      headers: request.headers,
    });
    return (await res.json()) as User;
  });
}

const SettingsPage: VoidComponent = () => {
  const user = useRouteData<typeof routeData>();

  // TODO: server action to update user data & update session
  // use createUserSession to 'update' session
  // PUT /api/user

  const [, logoutAction] = createServerAction$(async (_, { request }) => {
    console.log("logout");
    throw await logout(request);
  });

  return (
    // TODO: autocomplete attributes
    <div class="settings-page">
      <Title>Settings — Conduit</Title>
      <main class="container page">
        <pre>user = {JSON.stringify(user(), null, 2)}</pre>
        <div class="row">
          <div class="col-md-6 offset-md-3 col-xs-12">
            <h1 class="text-xs-center">Your Settings</h1>

            {/* will probably want errors list here */}

            <Suspense fallback="Getting your settings...">
              <form>
                <fieldset>
                  <fieldset class="form-group">
                    <input
                      class="form-control"
                      type="text"
                      placeholder="URL of profile picture"
                      value={user()?.image}
                    />
                  </fieldset>
                  <fieldset class="form-group">
                    <input
                      class="form-control form-control-lg"
                      type="text"
                      placeholder="Your Name"
                      autocomplete="username"
                      value={user()?.username}
                    />
                  </fieldset>
                  <fieldset class="form-group">
                    <textarea
                      class="form-control form-control-lg"
                      rows="8"
                      placeholder="Short bio about you"
                      value={user()?.bio}
                    />
                  </fieldset>
                  <fieldset class="form-group">
                    <input
                      class="form-control form-control-lg"
                      type="text"
                      placeholder="Email"
                      autocomplete="email"
                      value={user()?.email}
                    />
                  </fieldset>
                  <fieldset class="form-group">
                    <input
                      class="form-control form-control-lg"
                      type="password"
                      placeholder="Password"
                      autocomplete="new-password"
                    />
                  </fieldset>
                  <button class="btn btn-lg btn-primary pull-xs-right">
                    Update Settings
                  </button>
                </fieldset>
              </form>
            </Suspense>
            <hr />
            <button
              onClick={[logoutAction, undefined]}
              class="btn btn-outline-danger"
            >
              Or click here to logout.
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
