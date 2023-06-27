import type { ComponentProps, JSX, FlowComponent, Component } from "solid-js";
import { splitProps, Show } from "solid-js";
import { clientOnly } from "solid-start/islands";

import "highlight.js/styles/atom-one-dark.css";

// SolidMarkdown doesn't work with SSR, see
// https://github.com/andi23rosca/solid-markdown/issues/3
const SolidMarkdown = clientOnly(() => import("solid-markdown"));

// https://github.com/aidanaden/solid-highlight
// solid-highlight also seems to not work with SSR
const Highlight = clientOnly(() => import("solid-highlight"));

type SolidMarkdownProps = ComponentProps<typeof SolidMarkdown>;

type SolidMarkdownComponents = NonNullable<SolidMarkdownProps["components"]>;

// SolidMarkdown doesn't export the types of the separate components
type SolidMarkdownComponentProps<
  TagName extends keyof SolidMarkdownComponents
> = ComponentProps<
  Exclude<
    SolidMarkdownComponents[TagName],
    keyof JSX.IntrinsicElements | undefined
  >
>;

type CodeComponentProps = SolidMarkdownComponentProps<"code">;

/**
 * Syntax highlighting with solid-highlight for code blocks
 *
 * !!!! ffs SolidMarkdown uses className not class
 * @see https://github.com/remarkjs/react-markdown#use-custom-components-syntax-highlight
 */
const Code: Component<CodeComponentProps & { className: string }> = (
  _props
) => {
  // it seems that for some reason 'node' is not meant to be passed (idrk)
  const [, props] = splitProps(_props, ["node"]);

  const match = () => /language-(\w+)/.exec(props.className || "");

  const children = () => String(props.children).replace(/\n$/, "");

  return (
    <Show when={!props.inline && match()} fallback={<code {...props} />}>
      {(match) => (
        <Highlight {...props} language={match()[1]} autoDetect={false}>
          {children()}
        </Highlight>
      )}
    </Show>
  );
};

const ArticleContent: FlowComponent<unknown, string> = (props) => (
  <div class="row article-content">
    <article class="col-md-12">
      <SolidMarkdown
        components={{
          // @ts-expect-error SolidMarkdown uses `className` not `class` (is it ported from react properly?)
          code: Code,
        }}
      >
        {props.children}
      </SolidMarkdown>
    </article>
  </div>
);

export default ArticleContent;
