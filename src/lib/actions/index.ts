import type { createRouteAction } from "solid-start";
import type { Invalidate } from "solid-start/data/createRouteAction";

export type ActionOptions = Parameters<typeof createRouteAction>[1];

// eslint-disable-next-line @typescript-eslint/ban-types
type InvalidateFn = Extract<Invalidate, Function>;

export type InvalidateFnResult = ReturnType<InvalidateFn>;
