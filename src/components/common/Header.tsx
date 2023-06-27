import { type VoidComponent, Show } from "solid-js";
import { A } from "solid-start";

import { useSession } from "~/lib/session";

const Header: VoidComponent = () => {
  const session = useSession();
  const user = () => session()?.user;

  return (
    <nav class="navbar navbar-light">
      <div class="container">
        <A class="navbar-brand" href="/">
          conduit
        </A>
        <ul class="nav navbar-nav pull-xs-right">
          <li class="nav-item">
            <A href="/" class="nav-link" activeClass="active" end>
              Home
            </A>
          </li>
          <Show
            when={user()}
            fallback={
              <>
                <li class="nav-item">
                  <A href="/login" class="nav-link" activeClass="active">
                    Sign in
                  </A>
                </li>
                <li class="nav-item">
                  <A href="/register" class="nav-link" activeClass="active">
                    Sign up
                  </A>
                </li>
              </>
            }
          >
            {(user) => (
              <>
                <li class="nav-item">
                  <A href="/editor" class="nav-link" activeClass="active">
                    {" "}
                    <i class="ion-compose" />
                    &nbsp;New Article{" "}
                  </A>
                </li>
                <li class="nav-item">
                  <A href="/settings" class="nav-link" activeClass="active">
                    {" "}
                    <i class="ion-gear-a" />
                    &nbsp;Settings{" "}
                  </A>
                </li>
                <li class="nav-item">
                  <A
                    href={`/profile/${encodeURIComponent(user().username)}`}
                    class="nav-link"
                    end
                  >
                    <img
                      src={user().image}
                      alt={user().username}
                      class="user-pic"
                    />
                    {user().username}
                  </A>
                </li>
              </>
            )}
          </Show>
        </ul>
      </div>
    </nav>
  );
};

export default Header;
