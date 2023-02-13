import { type VoidComponent, Show } from "solid-js";
import { A } from "solid-start";

import type { Profile } from "~/types/api";
import { useSession } from "~/lib/session";
import FollowButton from "~/components/common/FollowButton";

export type UserInfoProps = Profile;

const UserInfo: VoidComponent<UserInfoProps> = (props) => {
  const session = useSession();
  const isMyProfile = () => session()?.user?.username === props.username;

  return (
    <div class="user-info">
      <div class="container">
        <div class="row">
          <div class="col-xs-12 col-md-10 offset-md-1">
            <img src={props.image} alt={props.username} class="user-img" />
            <h4>{props.username}</h4>
            <p>{props.bio}</p>

            <Show
              when={isMyProfile()}
              fallback={
                <FollowButton
                  username={props.username}
                  following={props.following}
                  invalidate={props.username}
                  class="btn btn-sm action-btn"
                />
              }
            >
              <A
                href="/settings"
                class="btn btn-sm btn-outline-secondary action-btn"
              >
                <i class="ion-gear-a" /> Edit Profile Settings
              </A>
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
