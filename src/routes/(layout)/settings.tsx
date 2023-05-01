import { type VoidComponent, Suspense } from "solid-js";
import { useRouteData, Title } from "solid-start";
import { createServerAction$, createServerData$ } from "solid-start/server";

import type { User } from "~/types/api";
import type { UpdateUserBody, UpdateUserError } from "~/routes/api/user";
import { createUserSession, logout } from "~/server/lib/session";
import ErrorsList from "~/components/user/ErrorsList";

export function routeData() {
  return createServerData$(async (_, { fetch, request }) => {
    const res = await fetch("api/user", {
      headers: request.headers,
    });

    if (!res.ok) throw res;

    return (await res.json()) as User;
  });
}

const SettingsPage: VoidComponent = () => {
  const user = useRouteData<typeof routeData>();

  const [updating, { Form }] = createServerAction$(
    async (formData: FormData, { fetch, request }) => {
      const body: UpdateUserBody = {
        user: Object.fromEntries(formData),
      };

      const res = await fetch("/api/user", {
        method: "POST",
        body: JSON.stringify(body),
        headers: request.headers,
      });

      if (!res.ok) {
        const { errors } = (await res.json()) as UpdateUserError;

        if (errors == "NAME_TAKEN") {
          throw ["Username already taken"];
        } else if (errors == "EMAIL_TAKEN") {
          throw ["Email already taken"];
        } else {
          throw ["Check form data", errors];
        }
      }

      const user = (await res.json()) as User;

      return await createUserSession(user, `/profile/${user.username}`);
    }
  );

  const [, logoutAction] = createServerAction$(
    async (_, { request }) => await logout(request)
  );

  return (
    <div class="settings-page">
      <Title>Settings — Conduit</Title>
      <main class="container page">
        <pre>user = {JSON.stringify(user(), null, 2)}</pre>
        <div class="row">
          <div class="col-md-6 offset-md-3 col-xs-12">
            <h1 class="text-xs-center">Your Settings</h1>

            <ErrorsList errors={updating.error} />

            <Suspense fallback="Getting your settings...">
              <Form>
                <fieldset>
                  <fieldset class="form-group">
                    <input
                      type="text"
                      name="image"
                      placeholder="URL of profile picture"
                      class="form-control"
                      value={user()?.image}
                    />
                  </fieldset>
                  <fieldset class="form-group">
                    <input
                      type="text"
                      name="username"
                      placeholder="Your Name"
                      autocomplete="username"
                      class="form-control form-control-lg"
                      value={user()?.username}
                    />
                  </fieldset>
                  <fieldset class="form-group">
                    <textarea
                      name="bio"
                      rows="8"
                      placeholder="Short bio about you"
                      class="form-control form-control-lg"
                      value={user()?.bio}
                    />
                  </fieldset>
                  <fieldset class="form-group">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      autocomplete="email"
                      class="form-control form-control-lg"
                      value={user()?.email}
                    />
                  </fieldset>
                  <fieldset class="form-group">
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      autocomplete="new-password"
                      class="form-control form-control-lg"
                    />
                  </fieldset>
                  <button
                    type="submit"
                    class="btn btn-lg btn-primary pull-xs-right"
                    disabled={updating.pending}
                  >
                    Update Settings
                  </button>
                </fieldset>
              </Form>
            </Suspense>
            <hr />
            <button
              type="button"
              onClick={() => logoutAction()}
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
