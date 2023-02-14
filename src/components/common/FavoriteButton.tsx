import type { JSX, FlowComponent } from "solid-js";
import { useNavigate } from "solid-start";

import type { Article } from "~/types/api";
import type { InvalidateFnResult } from "~/lib/actions";
import { useSession } from "~/lib/session";
import {
  createFavoriteAction,
  createUnfavoriteAction,
} from "~/lib/actions/favorite";

export type FavoriteButtonProps = Pick<
  Article,
  "slug" | "favorited" | "favoritesCount"
> & {
  invalidate: InvalidateFnResult;
  class?: string;
};

export type FavoriteButtonRenderFunc = (data: {
  favoriting: boolean;
  lookFavorited: boolean;
  unfavoriting: boolean;
  lookUnfavorited: boolean;
}) => JSX.Element;

const FavoriteButton: FlowComponent<
  FavoriteButtonProps,
  FavoriteButtonRenderFunc
> = (props) => {
  const navigate = useNavigate();

  const session = useSession();
  const isLoggedIn = () => Boolean(session()?.user);

  const [favoriting, favorite] = createFavoriteAction({
    invalidate: () => props.invalidate,
  });
  const [unfavoriting, unfavorite] = createUnfavoriteAction({
    invalidate: () => props.invalidate,
  });

  // for some reason returns false even if user is logged in
  // unless calling it before handleClick is called
  // I think it's because it hasn't queried the server for the session yet
  // TODO: try and find workaround/fix
  // this isn't a problem when using context for session
  // isLoggedIn();

  const handleClick = async () => {
    console.log("session", session());
    console.log("session.user", session()?.user);
    console.log("isLoggedIn =", isLoggedIn());

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
      class={props.class}
      classList={{
        "btn-primary": lookFavorited(),
        "btn-outline-primary": lookUnfavorited(),
      }}
      disabled={favoriting.pending || unfavoriting.pending}
    >
      {props.children({
        favoriting: favoriting.pending,
        lookFavorited: lookFavorited(),
        unfavoriting: unfavoriting.pending,
        lookUnfavorited: lookUnfavorited(),
      })}
    </button>
  );
};

export default FavoriteButton;
