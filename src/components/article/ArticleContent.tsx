import type { ParentComponent } from "solid-js";

// TODO: markdown or smthn
const ArticleContent: ParentComponent = (props) => (
  <div class="row article-content">
    <article class="col-md-12">{props.children}</article>
  </div>
);

export default ArticleContent;
