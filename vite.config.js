import { defineConfig } from "vite";

export default defineConfig({
  server: {
    historyApiFallback: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: "./index.html",
      },
    },
  },
});
