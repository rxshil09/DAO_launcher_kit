// vite.config.js
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.js";
import { defineConfig, loadEnv } from "file:///home/project/node_modules/vite/dist/node/index.js";
import environment from "file:///home/project/node_modules/vite-plugin-environment/dist/index.js";
import path from "path";
var __vite_injected_original_dirname = "/home/project/src/dao_frontend";
var vite_config_default = defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, path.resolve(__vite_injected_original_dirname), "");
  return {
    plugins: [
      react(),
      environment("all", { prefix: "VITE_" })
    ],
    optimizeDeps: {
      force: mode === "development",
      // Force optimization in dev mode
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
    cacheDir: process.platform === "win32" && process.env.WSL_DISTRO_NAME ? path.resolve(__vite_injected_original_dirname, ".vite-cache") : "node_modules/.vite",
    define: {
      global: "window",
      "process.env": process.env
    },
    server: {
      port: 5173,
      host: "0.0.0.0",
      // Allow external connections
      watch: {
        usePolling: true,
        // Enable polling for WSL file watching
        interval: 1e3
      },
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
      target: "esnext",
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            agent: ["@dfinity/agent", "@dfinity/auth-client"]
          }
        }
      },
      minify: mode === "production" ? "esbuild" : false,
      sourcemap: mode !== "production"
    },
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src"),
        "@declarations": path.resolve(__vite_injected_original_dirname, "../../src/declarations")
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9kYW9fZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL2Rhb19mcm9udGVuZC92aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3NyYy9kYW9fZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tICd1cmwnO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tICd2aXRlJztcclxuaW1wb3J0IGVudmlyb25tZW50IGZyb20gJ3ZpdGUtcGx1Z2luLWVudmlyb25tZW50JztcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgY29tbWFuZCwgbW9kZSB9KSA9PiB7XHJcbiAgLy8gTG9hZCBlbnZpcm9ubWVudCB2YXJpYWJsZXMgYmFzZWQgb24gbW9kZVxyXG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcGF0aC5yZXNvbHZlKF9fZGlybmFtZSksICcnKTtcclxuICBcclxuICByZXR1cm4ge1xyXG4gICAgcGx1Z2luczogW1xyXG4gICAgICByZWFjdCgpLFxyXG4gICAgICBlbnZpcm9ubWVudCgnYWxsJywgeyBwcmVmaXg6ICdWSVRFXycgfSksXHJcbiAgICBdLFxyXG4gICAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICAgIGZvcmNlOiBtb2RlID09PSAnZGV2ZWxvcG1lbnQnLCAvLyBGb3JjZSBvcHRpbWl6YXRpb24gaW4gZGV2IG1vZGVcclxuICAgICAgZXNidWlsZE9wdGlvbnM6IHtcclxuICAgICAgICBkZWZpbmU6IHtcclxuICAgICAgICAgIGdsb2JhbDogJ2dsb2JhbFRoaXMnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBwbHVnaW5zOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIG5hbWU6ICdkaWQtbG9hZGVyJyxcclxuICAgICAgICAgICAgc2V0dXAoYnVpbGQpIHtcclxuICAgICAgICAgICAgICBidWlsZC5vbkxvYWQoeyBmaWx0ZXI6IC9cXC5kaWQkLyB9LCBhc3luYyAoYXJncykgPT4gKHtcclxuICAgICAgICAgICAgICAgIGNvbnRlbnRzOiAnJyxcclxuICAgICAgICAgICAgICAgIGxvYWRlcjogJ2pzJ1xyXG4gICAgICAgICAgICAgIH0pKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgY2FjaGVEaXI6IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgJiYgcHJvY2Vzcy5lbnYuV1NMX0RJU1RST19OQU1FIFxyXG4gICAgICA/IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcudml0ZS1jYWNoZScpICAvLyBVc2UgY3VzdG9tIGNhY2hlIGRpciBmb3IgV1NMXHJcbiAgICAgIDogJ25vZGVfbW9kdWxlcy8udml0ZScsXHJcbiAgICBkZWZpbmU6IHtcclxuICAgICAgZ2xvYmFsOiAnd2luZG93JyxcclxuICAgICAgJ3Byb2Nlc3MuZW52JzogcHJvY2Vzcy5lbnZcclxuICAgIH0sXHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgcG9ydDogNTE3MyxcclxuICAgICAgaG9zdDogJzAuMC4wLjAnLCAvLyBBbGxvdyBleHRlcm5hbCBjb25uZWN0aW9uc1xyXG4gICAgICB3YXRjaDoge1xyXG4gICAgICAgIHVzZVBvbGxpbmc6IHRydWUsIC8vIEVuYWJsZSBwb2xsaW5nIGZvciBXU0wgZmlsZSB3YXRjaGluZ1xyXG4gICAgICAgIGludGVydmFsOiAxMDAwLFxyXG4gICAgICB9LFxyXG4gICAgICBwcm94eToge1xyXG4gICAgICAgICcvYXBpJzoge1xyXG4gICAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo0OTQzJyxcclxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGkvLCAnJyksXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBidWlsZDoge1xyXG4gICAgICBvdXREaXI6ICdkaXN0JyxcclxuICAgICAgZW1wdHlPdXREaXI6IHRydWUsXHJcbiAgICAgIHRhcmdldDogJ2VzbmV4dCcsXHJcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgICB2ZW5kb3I6IFsncmVhY3QnLCAncmVhY3QtZG9tJ10sXHJcbiAgICAgICAgICAgIGFnZW50OiBbJ0BkZmluaXR5L2FnZW50JywgJ0BkZmluaXR5L2F1dGgtY2xpZW50J10sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIG1pbmlmeTogbW9kZSA9PT0gJ3Byb2R1Y3Rpb24nID8gJ2VzYnVpbGQnIDogZmFsc2UsXHJcbiAgICAgIHNvdXJjZW1hcDogbW9kZSAhPT0gJ3Byb2R1Y3Rpb24nLFxyXG4gICAgfSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgYWxpYXM6IHtcclxuICAgICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpLFxyXG4gICAgICAgICdAZGVjbGFyYXRpb25zJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3NyYy9kZWNsYXJhdGlvbnMnKSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB0ZXN0OiB7XHJcbiAgICAgIGVudmlyb25tZW50OiAnanNkb20nLFxyXG4gICAgfSxcclxuICB9O1xyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLE9BQU8sV0FBVztBQUNsQixTQUFTLGNBQWMsZUFBZTtBQUN0QyxPQUFPLGlCQUFpQjtBQUN4QixPQUFPLFVBQVU7QUFKakIsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxTQUFTLEtBQUssTUFBTTtBQUVqRCxRQUFNLE1BQU0sUUFBUSxNQUFNLEtBQUssUUFBUSxnQ0FBUyxHQUFHLEVBQUU7QUFFckQsU0FBTztBQUFBLElBQ0wsU0FBUztBQUFBLE1BQ1AsTUFBTTtBQUFBLE1BQ04sWUFBWSxPQUFPLEVBQUUsUUFBUSxRQUFRLENBQUM7QUFBQSxJQUN4QztBQUFBLElBQ0EsY0FBYztBQUFBLE1BQ1osT0FBTyxTQUFTO0FBQUE7QUFBQSxNQUNoQixnQkFBZ0I7QUFBQSxRQUNkLFFBQVE7QUFBQSxVQUNOLFFBQVE7QUFBQSxRQUNWO0FBQUEsUUFDQSxTQUFTO0FBQUEsVUFDUDtBQUFBLFlBQ0UsTUFBTTtBQUFBLFlBQ04sTUFBTSxPQUFPO0FBQ1gsb0JBQU0sT0FBTyxFQUFFLFFBQVEsU0FBUyxHQUFHLE9BQU8sVUFBVTtBQUFBLGdCQUNsRCxVQUFVO0FBQUEsZ0JBQ1YsUUFBUTtBQUFBLGNBQ1YsRUFBRTtBQUFBLFlBQ0o7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxVQUFVLFFBQVEsYUFBYSxXQUFXLFFBQVEsSUFBSSxrQkFDbEQsS0FBSyxRQUFRLGtDQUFXLGFBQWEsSUFDckM7QUFBQSxJQUNKLFFBQVE7QUFBQSxNQUNOLFFBQVE7QUFBQSxNQUNSLGVBQWUsUUFBUTtBQUFBLElBQ3pCO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUE7QUFBQSxNQUNOLE9BQU87QUFBQSxRQUNMLFlBQVk7QUFBQTtBQUFBLFFBQ1osVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLE9BQU87QUFBQSxRQUNMLFFBQVE7QUFBQSxVQUNOLFFBQVE7QUFBQSxVQUNSLGNBQWM7QUFBQSxVQUNkLFNBQVMsQ0FBQ0EsVUFBU0EsTUFBSyxRQUFRLFVBQVUsRUFBRTtBQUFBLFFBQzlDO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxNQUNSLGFBQWE7QUFBQSxNQUNiLFFBQVE7QUFBQSxNQUNSLGVBQWU7QUFBQSxRQUNiLFFBQVE7QUFBQSxVQUNOLGNBQWM7QUFBQSxZQUNaLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFBQSxZQUM3QixPQUFPLENBQUMsa0JBQWtCLHNCQUFzQjtBQUFBLFVBQ2xEO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFFBQVEsU0FBUyxlQUFlLFlBQVk7QUFBQSxNQUM1QyxXQUFXLFNBQVM7QUFBQSxJQUN0QjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLFFBQ3BDLGlCQUFpQixLQUFLLFFBQVEsa0NBQVcsd0JBQXdCO0FBQUEsTUFDbkU7QUFBQSxJQUNGO0FBQUEsSUFDQSxNQUFNO0FBQUEsTUFDSixhQUFhO0FBQUEsSUFDZjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogWyJwYXRoIl0KfQo=
