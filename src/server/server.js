import { FlatFile, Server } from 'boardgame.io/server';
import path from 'path';
import serve from 'koa-static';
import { SanGuoSha } from '../lib/game';

const db = new FlatFile({ dir: 'data' });
const server = Server({
    games: [SanGuoSha],
    db,
});
const PORT = process.env.PORT;

// Build path relative to the server.js file
const frontEndAppBuildPath = path.resolve(__dirname, '../../build');
server.app.use(serve(frontEndAppBuildPath))

server.run(PORT, () => {
    server.app.use(
        async (ctx, next) => await serve(frontEndAppBuildPath)(
            Object.assign(ctx, { path: 'index.html' }),
            next
        )
    )
});

// Clean up old matches
const week = 7 * 24 * 60 * 60 * 1000;
setInterval(() => {
    db.listMatches({ where: { updatedBefore: Date.now() - week } }).then(matchIDs => {
        for (const matchID of matchIDs) {
            db.wipe(matchID);
        }
    });
}, week);
