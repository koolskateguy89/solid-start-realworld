import type { ComponentProps, JSX, FlowComponent, Component } from "solid-js";
import { splitProps, Show } from "solid-js";
import { clientOnly } from "solid-start/islands";
// import type { SolidMarkdownProps } from "solid-markdown/dist/complex-types";

// SolidMarkdown doesn't work with SSR, see
// https://github.com/andi23rosca/solid-markdown/issues/3
const SolidMarkdown = clientOnly(() => import("solid-markdown"));

// TODO: syntax highlighting, see
// https://github.com/remarkjs/react-markdown#use-custom-components-syntax-highlight

// declare const SyntaxHighlighter: (props: any) => JSX.Element;
const SyntaxHighlighter: Component<any> = (props) => null;

type SolidMarkdownProps = ComponentProps<typeof SolidMarkdown>;

// SolidMarkdown doesn't export the types of the separate components :cry:
type CodeComponentProps = ComponentProps<
  Exclude<
    NonNullable<SolidMarkdownProps["components"]>["code"],
    keyof JSX.IntrinsicElements | undefined
  >
>;

// code for component pretty much taken directly from
// https://github.com/remarkjs/react-markdown#use-custom-components-syntax-highlight
// !!!! ffs SolidMarkdown uses className not class
const Code: Component<CodeComponentProps & { className: string }> = (
  _props
) => {
  // it seems that for some reason 'node' is not meant to be passed (idrk)
  const [, props] = splitProps(_props, ["node"]);

  const match = () => /language-(\w+)/.exec(props.className || "");

  return (
    <Show when={!props.inline && match()} fallback={<code {...props} />} keyed>
      {(match) => (
        <>
          <SyntaxHighlighter
            {...props}
            children={String(props.children).replace(/\n$/, "")}
            // import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism'
            // style={dark}
            language={match[1]}
            PreTag="div"
          />
          <code {...props}>hahahaah!</code>
        </>
      )}
    </Show>
  );
};

const ArticleContent: FlowComponent<unknown, string> = (props) => (
  <div class="row article-content">
    <article class="col-md-12">
      <SolidMarkdown
        components={{
          // @ts-expect-error SolidMarkdown uses `className` not `class` (don't think it's ported from react properly)
          code: Code,
        }}
      >
        {props.children}
      </SolidMarkdown>
    </article>
  </div>
);

export default ArticleContent;
