import { type VoidComponent, Suspense, For } from "solid-js";
import { createRouteData, A } from "solid-start";

import type { ListOfTags } from "~/types/api";

const Sidebar: VoidComponent = () => {
  const tags = createRouteData(async (_, { fetch }) => {
    const res = await fetch("/api/tags", {});

    const { tags } = (await res.json()) as ListOfTags;
    return tags;
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
