import { type VoidComponent, For } from "solid-js";

import Comment, { type CommentProps } from "./Comment";

export type CommentListProps = {
  comments: Omit<CommentProps, "onDelete">[];
  onDelete: (id: number) => void;
};

const CommentList: VoidComponent<CommentListProps> = (props) => {
  return (
    <For each={props.comments}>
      {(comment) => <Comment {...comment} onDelete={props.onDelete} />}
    </For>
  );
};

export default CommentList;
