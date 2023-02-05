import type { VoidComponent } from "solid-js";
import { Title, A } from "solid-start";
import {
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";

import { getUserProfile, createUserSession } from "~/server/lib/session";
import type { User } from "~/types/api";
import type { RegistrationError } from "~/routes/api/users/(register)";
import ErrorsList from "~/components/user/ErrorsList";

export function routeData() {
  // if signed in, redirect to home page
  return createServerData$(async (_, { request }) => {
    const user = await getUserProfile(request);
    if (user) throw redirect("/");
  });
}

// Note: validation is all done on the server
const RegisterPage: VoidComponent = () => {
  const [registering, { Form }] = createServerAction$(
    async (formData: FormData, { fetch }) => {
      const res = await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify({
          user: Object.fromEntries(formData),
        }),
      });
      const user = (await res.json()) as User | RegistrationError;

      console.log("user =", user);

      if ("errors" in user) {
        if (user.errors === "invalid") {
          throw "Check credentials";
        } else {
          throw "That email is already taken";
        }
      }

      // localStorage.setItem("token", data.token);
      throw await createUserSession(user, "/");
    }
  );

  return (
    <div class="auth-page">
      <Title>Register — Conduit</Title>
      <main class="container page">
        <div class="row">
          <div class="col-md-6 offset-md-3 col-xs-12">
            <h1 class="text-xs-center">Sign up</h1>
            <p class="text-xs-center">
              <A href="/login">Have an account?</A>
            </p>

            <ErrorsList errors={registering.error && [registering.error]} />

            <Form>
              <fieldset class="form-group">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  autocomplete="username"
                  class="form-control form-control-lg"
                  value="test"
                />
              </fieldset>
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
                  autocomplete="new-password"
                  class="form-control form-control-lg"
                  value="pass"
                />
              </fieldset>
              <button
                type="submit"
                class="btn btn-lg btn-primary pull-xs-right"
                disabled={registering.pending}
              >
                Sign up
              </button>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
