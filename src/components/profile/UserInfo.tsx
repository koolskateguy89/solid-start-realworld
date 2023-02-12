import { type VoidComponent, Show } from "solid-js";

import type { Profile } from "~/types/api";
import { useSession } from "~/lib/session";

export type UserInfoProps = Profile;

const UserInfo: VoidComponent<UserInfoProps> = (props) => {
  const session = useSession();

  const canFollow = () => session()?.user?.username !== props.username;

  // TODO: action follow/unfollow

  return (
    <div class="user-info">
      <div class="container">
        <div class="row">
          <div class="col-xs-12 col-md-10 offset-md-1">
            <img src={props.image} alt={props.username} class="user-img" />
            <h4>{props.username}</h4>
            <p>{props.bio}</p>
            <Show when={canFollow()}>
              <button
                type="button"
                class="btn btn-sm action-btn"
                classList={{
                  "btn-secondary": props.following,
                  "btn-outline-secondary": !props.following,
                }}
              >
                <i class="ion-plus-round" />
                &nbsp; {props.following ? "Unfollow" : "Follow"}{" "}
                {props.username}
              </button>
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
