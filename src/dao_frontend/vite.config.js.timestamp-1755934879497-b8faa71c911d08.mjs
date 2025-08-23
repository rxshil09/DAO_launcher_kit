// vite.config.js
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.js";
import { defineConfig, loadEnv } from "file:///home/project/node_modules/vite/dist/node/index.js";
import environment from "file:///home/project/node_modules/vite-plugin-environment/dist/index.js";
import path from "path";
var __vite_injected_original_dirname = "/home/project/src/dao_frontend";
var vite_config_default = defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, path.resolve(__vite_injected_original_dirname, "../.."), "");
  return {
    plugins: [
      react(),
      environment("all", { prefix: "VITE_" })
    ],
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: "globalThis"
        },
        plugins: [
          {
            name: "did-loader",
            setup(build) {
              build.onLoad({ filter: /\.did$/ }, async (args) => ({
                contents: "",
                loader: "js"
              }));
            }
          }
        ]
      }
    },
    define: {
      global: "window",
      "process.env": process.env
    },
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:4943",
          changeOrigin: true,
          rewrite: (path2) => path2.replace(/^\/api/, "")
        }
      }
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
      target: "esnext"
    },
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src"),
        "@declarations": path.resolve(__vite_injected_original_dirname, "./src/declarations")
      }
    },
    test: {
      environment: "jsdom"
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9kYW9fZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL2Rhb19mcm9udGVuZC92aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3NyYy9kYW9fZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tICd1cmwnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IGVudmlyb25tZW50IGZyb20gJ3ZpdGUtcGx1Z2luLWVudmlyb25tZW50JztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgY29tbWFuZCwgbW9kZSB9KSA9PiB7XG4gIC8vIExvYWQgZW52aXJvbm1lbnQgdmFyaWFibGVzIGZyb20gdGhlIHBhcmVudCBkaXJlY3RvcnlcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4nKSwgJycpO1xuICBcbiAgcmV0dXJuIHtcbiAgICBwbHVnaW5zOiBbXG4gICAgICByZWFjdCgpLFxuICAgICAgZW52aXJvbm1lbnQoJ2FsbCcsIHsgcHJlZml4OiAnVklURV8nIH0pLFxuICAgIF0sXG4gICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICBlc2J1aWxkT3B0aW9uczoge1xuICAgICAgICBkZWZpbmU6IHtcbiAgICAgICAgICBnbG9iYWw6ICdnbG9iYWxUaGlzJ1xuICAgICAgICB9LFxuICAgICAgICBwbHVnaW5zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ2RpZC1sb2FkZXInLFxuICAgICAgICAgICAgc2V0dXAoYnVpbGQpIHtcbiAgICAgICAgICAgICAgYnVpbGQub25Mb2FkKHsgZmlsdGVyOiAvXFwuZGlkJC8gfSwgYXN5bmMgKGFyZ3MpID0+ICh7XG4gICAgICAgICAgICAgICAgY29udGVudHM6ICcnLFxuICAgICAgICAgICAgICAgIGxvYWRlcjogJ2pzJ1xuICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9LFxuICAgIGRlZmluZToge1xuICAgICAgZ2xvYmFsOiAnd2luZG93JyxcbiAgICAgICdwcm9jZXNzLmVudic6IHByb2Nlc3MuZW52XG4gICAgfSxcbiAgICBzZXJ2ZXI6IHtcbiAgICAgIHByb3h5OiB7XG4gICAgICAgICcvYXBpJzoge1xuICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NDk0MycsXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGkvLCAnJyksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIG91dERpcjogJ2Rpc3QnLFxuICAgICAgZW1wdHlPdXREaXI6IHRydWUsXG4gICAgICB0YXJnZXQ6ICdlc25leHQnLFxuICAgIH0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcbiAgICAgICAgJ0BkZWNsYXJhdGlvbnMnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvZGVjbGFyYXRpb25zJyksXG4gICAgICB9LFxuICAgIH0sXG4gICAgdGVzdDoge1xuICAgICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXG4gICAgfSxcbiAgfTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLE9BQU8sV0FBVztBQUNsQixTQUFTLGNBQWMsZUFBZTtBQUN0QyxPQUFPLGlCQUFpQjtBQUN4QixPQUFPLFVBQVU7QUFKakIsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxTQUFTLEtBQUssTUFBTTtBQUVqRCxRQUFNLE1BQU0sUUFBUSxNQUFNLEtBQUssUUFBUSxrQ0FBVyxPQUFPLEdBQUcsRUFBRTtBQUU5RCxTQUFPO0FBQUEsSUFDTCxTQUFTO0FBQUEsTUFDUCxNQUFNO0FBQUEsTUFDTixZQUFZLE9BQU8sRUFBRSxRQUFRLFFBQVEsQ0FBQztBQUFBLElBQ3hDO0FBQUEsSUFDQSxjQUFjO0FBQUEsTUFDWixnQkFBZ0I7QUFBQSxRQUNkLFFBQVE7QUFBQSxVQUNOLFFBQVE7QUFBQSxRQUNWO0FBQUEsUUFDQSxTQUFTO0FBQUEsVUFDUDtBQUFBLFlBQ0UsTUFBTTtBQUFBLFlBQ04sTUFBTSxPQUFPO0FBQ1gsb0JBQU0sT0FBTyxFQUFFLFFBQVEsU0FBUyxHQUFHLE9BQU8sVUFBVTtBQUFBLGdCQUNsRCxVQUFVO0FBQUEsZ0JBQ1YsUUFBUTtBQUFBLGNBQ1YsRUFBRTtBQUFBLFlBQ0o7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixRQUFRO0FBQUEsTUFDUixlQUFlLFFBQVE7QUFBQSxJQUN6QjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sT0FBTztBQUFBLFFBQ0wsUUFBUTtBQUFBLFVBQ04sUUFBUTtBQUFBLFVBQ1IsY0FBYztBQUFBLFVBQ2QsU0FBUyxDQUFDQSxVQUFTQSxNQUFLLFFBQVEsVUFBVSxFQUFFO0FBQUEsUUFDOUM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1IsYUFBYTtBQUFBLE1BQ2IsUUFBUTtBQUFBLElBQ1Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxRQUNwQyxpQkFBaUIsS0FBSyxRQUFRLGtDQUFXLG9CQUFvQjtBQUFBLE1BQy9EO0FBQUEsSUFDRjtBQUFBLElBQ0EsTUFBTTtBQUFBLE1BQ0osYUFBYTtBQUFBLElBQ2Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFsicGF0aCJdCn0K
