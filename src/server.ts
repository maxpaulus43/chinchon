import { Origins, Server } from "boardgame.io/server";
import path from "path";
import serve from "koa-static";
import { Chinchon } from "./Game";

const PORT = parseInt(process.env.PORT ?? "8081");
const server = Server({
  games: [Chinchon],
  origins: [
    // Allow your game site to connect.
    "https://chinchon-game.herokuapp.com",
    // Allow localhost to connect, except when NODE_ENV is 'production'.
    Origins.LOCALHOST_IN_DEVELOPMENT,
  ],
});

// Build path relative to the server.js file
const frontEndAppBuildPath = path.resolve(__dirname, "../build");
server.app.use(
  serve(frontEndAppBuildPath, { maxAge: 3.154e10 }) // 1 year
);

server.run({ port: PORT }, () => {
  server.app.use(
    async (ctx, next) =>
      await serve(frontEndAppBuildPath)(
        Object.assign(ctx, { path: "index.html" }),
        next
      )
  );
});
