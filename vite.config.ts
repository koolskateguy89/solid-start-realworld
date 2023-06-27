import { defineConfig } from "vite";
import solid from "solid-start/vite";
import vercel from "solid-start-vercel";

export default defineConfig(() => {
  return {
    plugins: [solid({ ssr: true, adapter: vercel({ edge: false }) })],
  };
});
