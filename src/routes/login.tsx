import type { VoidComponent } from "solid-js";
import { Title, A } from "solid-start";
import {
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";

import { getUserProfile, createUserSession } from "~/server/lib/session";
import type { User } from "~/types/api";
import type { SigninError } from "~/routes/api/users/login";
import ErrorsList from "~/components/user/ErrorsList";

// TODO: properly show SigninError

// TODO?: handle redirectTo query param (see lib/session.server.ts)

export function routeData() {
  // if signed in, redirect to home page
  return createServerData$(async (_, { request }) => {
    const user = await getUserProfile(request);
    if (user) throw redirect("/");
  });
}

const LoginPage: VoidComponent = () => {
  const [loggingIn, { Form }] = createServerAction$(
    async (formData: FormData, { fetch }) => {
      const res = await fetch("/api/users/login", {
        method: "POST",
        body: JSON.stringify({
          user: Object.fromEntries(formData),
        }),
      });
      const user = (await res.json()) as User | SigninError;

      if ("errors" in user) {
        if (user.errors === "notexists") {
          throw "Account does not exist";
        } else {
          throw "Check your credentials";
        }
      }

      // localStorage.setItem("token", data.token);
      throw await createUserSession(user, "/");
    }
  );

  return (
    <div class="auth-page">
      <Title>Sign in — Conduit</Title>
      <main class="container page">
        <div class="row">
          <div class="col-md-6 offset-md-3 col-xs-12">
            <h1 class="text-xs-center">Sign in</h1>
            <p class="text-xs-center">
              <A href="/register">Need an account?</A>
            </p>

            <ErrorsList errors={loggingIn.error && [loggingIn.error]} />

            <Form>
              <fieldset class="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  autocomplete="email"
                  class="form-control form-control-lg"
                  value="test@test.com"
                />
              </fieldset>
              <fieldset class="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  autocomplete="current-password"
                  class="form-control form-control-lg"
                  value="pass"
                />
              </fieldset>
              <button
                type="submit"
                class="btn btn-lg btn-primary pull-xs-right"
                disabled={loggingIn.pending}
              >
                Sign in
              </button>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
