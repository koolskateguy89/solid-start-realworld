import { type VoidComponent, For, Show } from "solid-js";
import { useLocation, useSearchParams, A } from "solid-start";

export type PaginationProps = {
  totalPages: number;
};

const Pagination: VoidComponent<PaginationProps> = (props) => {
  const location = useLocation();

  const [searchParams] = useSearchParams<{ page?: string }>();
  const currentPage = () => parseInt(searchParams.page ?? "1") || 1;

  const pages = () => {
    function range(start: number, end: number) {
      return Array.from({ length: end - start + 1 }, (_, i) => i + start);
    }

    if (props.totalPages <= 20) return range(1, props.totalPages);

    const isFirstTen = currentPage() <= 10;
    const isLastTen = props.totalPages - currentPage() < 10;

    if (isFirstTen) return range(1, 20);
    if (isLastTen) return range(props.totalPages - 19, props.totalPages);

    return range(currentPage() - 10, currentPage() + 9);
  };

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
        <pre>props.totalPages = {props.totalPages}</pre>

        <ul class="pagination">
          <For each={pages()}>
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
