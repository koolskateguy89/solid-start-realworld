import { type VoidComponent, Suspense, For } from "solid-js";
import { A } from "solid-start";
import { createServerData$ } from "solid-start/server";

import type { ListOfTags } from "~/types/api";

const Sidebar: VoidComponent = () => {
  const tags = createServerData$(async (_, { fetch }) => {
    const res = await fetch("/api/tags", {});
    const data = (await res.json()) as ListOfTags;

    return data.tags.concat("lol");
  });

  return (
    <div class="sidebar">
      <p>Popular Tags</p>

      <Suspense fallback="Loading...">
        <div class="tag-list">
          <For each={tags()}>
            {(tag) => (
              <A
                href={`?tag=${encodeURIComponent(tag)}`}
                class="tag-pill tag-default"
              >
                {tag}
              </A>
            )}
          </For>
        </div>
      </Suspense>
    </div>
  );
};

export default Sidebar;
