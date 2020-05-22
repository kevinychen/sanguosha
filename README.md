# San Guo Sha

Online multiplayer card game

## Quickstart

Run:

    npm install
    npm run build   # build assets
    npm run server  # start the server

Then go to http://localhost:8098.

## Development

- Run `npm install`.
- If you want to test a client-side only game, set `MULTIPLAYER = false` in `room.js`, and remove the proxy line in `package.json`.
- If you want to test a single game, set `START_IN_LOBBY = false` in `index.js`.
- Run `npm run server` (unless you are testing a client-side only game).
- Run `npm run start` and visit http://localhost:3000.

Restart the server to clear game and lobby state. The client does not need to be started unless dependencies are updated.

