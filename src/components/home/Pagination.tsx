import { type VoidComponent, For, Show } from "solid-js";
import { useLocation, useSearchParams, A } from "solid-start";

export type PaginationProps = {
  totalPages: number;
};

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => i + start);
}

/*
TODO:
will need to handle if totalPages > 20

cos will only want to show 20 buttons,
can try to centre the currentPage but will want
it to be like trailing, e.g.

1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 *18* 19 20

18 won't be in the middle, because it is in the last half of the range
*/

const Pagination: VoidComponent<PaginationProps> = (props) => {
  const location = useLocation();

  const [searchParams] = useSearchParams<{ page?: string }>();
  const currentPage = () => parseInt(searchParams.page ?? "1") || 1;

  const makeHref = (page: number) => {
    const newSearchParams = new URLSearchParams(searchParams);

    newSearchParams.set("page", page.toString());

    return `?${newSearchParams}${location.hash}`;
  };

  return (
    <Show when={props.totalPages > 1}>
      <nav>
        <pre>searchParams = {JSON.stringify(searchParams, null, 2)}</pre>
        <pre>currentPage = {currentPage()}</pre>

        <ul class="pagination">
          <For each={range(1, props.totalPages)}>
            {(pageNumber) => (
              <li
                class="page-item"
                classList={{
                  active: pageNumber === currentPage(),
                }}
              >
                <A href={makeHref(pageNumber)} class="page-link">
                  {pageNumber}
                </A>
              </li>
            )}
          </For>
        </ul>
      </nav>
    </Show>
  );
};

export default Pagination;
