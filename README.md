# San Guo Sha (三国杀)

San Guo Sha is a [popular Chinese card game](https://en.wikipedia.org/wiki/Legends_of_the_Three_Kingdoms). This online multiplayer English version supports all the characters and cards in the base set.

![Sanguosha](docs/sanguosha.gif)

Translations of all characters and cards are easily accessible in-game.

![Translations](docs/translations.gif)

See the debut trailer [here](https://kevinychen.github.io/sanguosha).

## Quickstart

Running this game requires npm v6+ and NodeJS v12+.

Run:

    npm install
    npm run build   # build assets
    npm run server  # start the server

Then go to http://localhost:8098.

## Development

- First run `npm install` once.
- To run a game client-side only, run `npm run start`. To run with the server, run `npm run server` and `npm run client` in two different consoles.
- Go to http://localhost:3000.

## Credits

- [Becky Shi](https://shenlab.stanford.edu/people/rebecca-shi), for composing the original game background music and producing the debut trailer
- [boardgame.io](https://boardgame.io/), a very convenient framework for producing online multiplayer games
- [react-spring](https://www.react-spring.io/), an amazing library for easily producing animations
- [English Sanguosha](http://www.englishsanguosha.com/), for rules, resources, and translations
- Eva Yeung, Jeff Chen, Michael Wu, Natalle Yu, Tommy Zhang, and Yi-Shiuan Tung for playtesting

