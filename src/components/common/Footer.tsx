import type { VoidComponent } from "solid-js";
import { A } from "solid-start";

const Footer: VoidComponent = () => {
  return (
    <footer>
      <div class="container">
        <A href="/" class="logo-font">
          conduit
        </A>
        <span class="attribution">
          An interactive learning project from{" "}
          <a href="https://thinkster.io">Thinkster</a>. Code &amp; design
          licensed under MIT.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
