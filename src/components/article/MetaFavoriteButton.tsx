import { type VoidComponent, Switch, Match } from "solid-js";
import { useNavigate } from "solid-start";

import { useSession } from "~/lib/session";
import {
  createFavoriteAction,
  createUnfavoriteAction,
} from "~/lib/actions/favorite";

export type MetaFavoriteButtonProps = {
  slug: string;
  favorited: boolean;
  favoritesCount: number;
};

// Optimistic UI
const MetaFavoriteButton: VoidComponent<MetaFavoriteButtonProps> = (props) => {
  const navigate = useNavigate();

  const session = useSession();
  const isLoggedIn = () => Boolean(session()?.user);

  // TODO: use invalidate key
  const [favoriting, favorite] = createFavoriteAction();
  const [unfavoriting, unfavorite] = createUnfavoriteAction();

  const handleClick = async () => {
    if (!isLoggedIn()) return navigate("/login");

    await (props.favorited ? unfavorite(props.slug) : favorite(props.slug));
  };

  const lookFavorited = () =>
    !unfavoriting.pending && (props.favorited || favoriting.pending);
  const lookUnfavorited = () =>
    !favoriting.pending && (!props.favorited || unfavoriting.pending);

  return (
    <button
      type="button"
      onClick={handleClick}
      class="btn btn-sm"
      classList={{
        "btn-primary": lookFavorited(),
        "btn-outline-primary": lookUnfavorited(),
      }}
      disabled={favoriting.pending || unfavoriting.pending}
    >
      <i class="ion-heart" />
      &nbsp;{" "}
      <Switch>
        <Match when={lookFavorited()}>Unfavorite</Match>
        <Match when={lookUnfavorited()}>Favorite</Match>
      </Switch>{" "}
      Post{" "}
      <span class="counter">
        (
        <Switch fallback={`${props.favoritesCount}`}>
          <Match when={favoriting.pending}>{props.favoritesCount + 1}</Match>
          <Match when={unfavoriting.pending}>{props.favoritesCount - 1}</Match>
        </Switch>
        )
      </span>
    </button>
  );
};

export default MetaFavoriteButton;
