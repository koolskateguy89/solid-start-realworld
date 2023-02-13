import { type VoidComponent, Switch, Match } from "solid-js";
import { useNavigate } from "solid-start";

import type { InvalidateFnResult } from "~/lib/actions";
import { useSession } from "~/lib/session";
import { createFollowAction, createUnfollowAction } from "~/lib/actions/follow";

export type FollowButtonProps = {
  username: string;
  following: boolean;
  invalidate?: InvalidateFnResult;
  class: string;
};

// Optimistic UI
const FollowButton: VoidComponent<FollowButtonProps> = (props) => {
  const navigate = useNavigate();

  const session = useSession();
  const isLoggedIn = () => Boolean(session()?.user);

  const [following, follow] = createFollowAction({
    invalidate: () => props.invalidate,
  });
  const [unfollowing, unfollow] = createUnfollowAction({
    invalidate: () => props.invalidate,
  });

  const handleClick = async () => {
    if (!isLoggedIn()) return navigate("/login");

    await (props.following ? unfollow(props.username) : follow(props.username));
  };

  const lookFollowing = () =>
    !unfollowing.pending && (props.following || following.pending);
  const lookUnfollowing = () =>
    !following.pending && (!props.following || unfollowing.pending);

  return (
    <button
      type="button"
      onClick={handleClick}
      class={props.class}
      classList={{
        "btn-secondary": lookFollowing(),
        "btn-outline-secondary": lookUnfollowing(),
      }}
      disabled={following.pending || unfollowing.pending}
    >
      <i class="ion-plus-round" />
      &nbsp;{" "}
      <Switch>
        <Match when={lookFollowing()}>Unfollow</Match>
        <Match when={lookUnfollowing()}>Follow</Match>
      </Switch>{" "}
      {props.username}
    </button>
  );
};

export default FollowButton;
