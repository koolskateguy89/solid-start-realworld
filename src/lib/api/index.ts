// typesafe API wrapper basically (split into different files - articles, users, etc.)
// inspiration:
// https://github.com/reck1ess/next-realworld-example-app/blob/master/lib/api/article.ts
// https://github.com/solidjs/solid-realworld/blob/main/src/store/createAgent.js

import * as articles from "./articles";

export const api = {
  articles,
};
