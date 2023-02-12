import { type VoidComponent, For } from "solid-js";

import Comment, { type CommentProps } from "./Comment";

export type CommentListProps = {
  comments: CommentProps[];
};

const CommentList: VoidComponent<CommentListProps> = (props) => {
  return (
    <For each={props.comments}>{(comment) => <Comment {...comment} />}</For>
  );
};

export default CommentList;
