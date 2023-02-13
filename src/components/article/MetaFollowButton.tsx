import { type VoidComponent, Switch, Match } from "solid-js";
import { useNavigate } from "solid-start";

import { useSession } from "~/lib/session";
import { createFollowAction, createUnfollowAction } from "~/lib/actions/follow";

export type MetaFollowButtonProps = {
  username: string;
  following: boolean;
};

// Optimistic UI
const MetaFollowButton: VoidComponent<MetaFollowButtonProps> = (props) => {
  const navigate = useNavigate();

  const session = useSession();
  const isLoggedIn = () => Boolean(session()?.user);

  // TODO: use invalidate key
  const [following, follow] = createFollowAction();
  const [unfollowing, unfollow] = createUnfollowAction();

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
      class="btn btn-sm"
      classList={{
        "btn-secondary": lookFollowing(),
        "btn-outline-secondary": lookUnfollowing(),
      }}
      disabled={following.pending || unfollowing.pending}
    >
      <i class="ion-plus-round" />
      &nbsp;{" "}
      <Switch>
        <Match when={lookUnfollowing()}>Unfollow</Match>
        <Match when={lookFollowing()}>Follow</Match>
      </Switch>{" "}
      {props.username}
    </button>
  );
};

export default MetaFollowButton;
