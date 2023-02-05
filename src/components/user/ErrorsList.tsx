import { type VoidComponent, For } from "solid-js";

export type ErrorsListProps = {
  errors: string[];
};

const ErrorsList: VoidComponent<ErrorsListProps> = (props) => {
  // TODO
  return (
    <ul class="error-messages">
      <For each={props.errors}>{(error) => <li>{error}</li>}</For>
    </ul>
  );
};

export default ErrorsList;
