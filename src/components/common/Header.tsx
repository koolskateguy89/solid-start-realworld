/* eslint-disable jsx-a11y/anchor-is-valid */
import type { VoidComponent } from "solid-js";
import { A } from "solid-start";

const Header: VoidComponent = () => {
  return (
    <nav class="navbar navbar-light">
      <div class="container">
        <A class="navbar-brand" href="/">
          conduit
        </A>
        <ul class="nav navbar-nav pull-xs-right">
          {/* TODO: think the first 3 are only meant to show when signed in */}

          <li class="nav-item">
            {/* TODO: Add "active" class when you're on that page" */}
            <A class="nav-link active" href="/">
              Home
            </A>
          </li>
          <li class="nav-item">
            <A class="nav-link" href="/editor">
              {" "}
              <i class="ion-compose" />
              &nbsp;New Article{" "}
            </A>
          </li>
          <li class="nav-item">
            <A class="nav-link" href="/settings">
              {" "}
              <i class="ion-gear-a" />
              &nbsp;Settings{" "}
            </A>
          </li>
          <li class="nav-item">
            <A class="nav-link" href="/login">
              Sign in
            </A>
          </li>
          <li class="nav-item">
            <A class="nav-link" href="/register">
              Sign up
            </A>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Header;
