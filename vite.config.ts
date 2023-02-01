import { defineConfig } from "vite";
import solid from "solid-start/vite";
// @ts-expect-error no typing
import vercel from "solid-start-vercel";

export default defineConfig(() => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    plugins: [solid({ ssr: true, adapter: vercel({ edge: false }) })],
  };
});
