# San Guo Sha (三国杀)

San Guo Sha is a [popular Chinese card game](https://en.wikipedia.org/wiki/Legends_of_the_Three_Kingdoms). This online multiplayer English version supports all the characters and cards in the base set, as well as the [wind, fire, and wood expansions](http://sanguoshaenglish.blogspot.com/p/expansions.html). Try it at https://util.in:8098.

![Sanguosha](docs/sanguosha.gif)

Translations of all characters and cards are easily accessible in-game.

![Translations](docs/translations.gif)

See the debut trailer [here](https://kevinychen.github.io/sanguosha).

## How to use

This app allows players to perform all the possible actions in the base set and supported expansions, but does not enforce rules other than tracking turn order and end-of-turn discards. The goal is to make it possible to easily play the game online with friends.

To draw a card from the deck, click the deck or press 'C'. (Click the "hotkeys" button on the left to see all hotkeys.)

To play a card from hand normally, click on it or press the number corresponding to its position in your hand. The action will depend on the card; for example, equipment will be played on your character card, delay tool cards will prompt you to select a player to play it on, and most other cards will be sent to the discard pile in the middle of the screen. If you wish to send an equipment or delay tool card directly to the discard, then click "Dismantle" before selecting the card.

The buttons on the left allow you to perform other actions, such as Giving one of your cards to another player, Dismantling/Stealing another card, Revealing one of your cards to another player, Flipping a card/character card, performing a Judgment, displaying N cards for a Harvest, or passing the Lightning card to the next player.

To increase or decrease your health, click on the large health icons on your character card. If your health reaches 0, you reach "Brink of Death" and the game will prompt for whether you die. You can also toggle your chain status by clicking on the semi-transparent chain icon on your character card.

Finally, some characters have special abilities that might not be possible to perform with the above actions. In these cases, there will be a special button on the left. For example, Zhuge Liang can click "Astrology" to view N cards, put some on top of the deck, and send the remaining to the bottom of the deck.

To view English descriptions, click "Help" and then a card or character card to get its description.

## Quickstart

Run:

    yarn install
    yarn build   # build assets
    yarn server  # start the server

Then go to http://localhost:8098.

## Development

- First run `yarn install` once.
- To run a game client-side only, run `yarn start`. To run with the server, run `yarn server` and `yarn client` in two different consoles.
- Go to http://localhost:3000.

## Credits

- [Sanguosha](https://www.sanguosha.com/) for the game
- [Becky Shi](https://shenlab.stanford.edu/people/rebecca-shi), for composing the original game background music and producing the debut trailer
- [boardgame.io](https://boardgame.io/), a very convenient framework for producing online multiplayer games
- [react-spring](https://www.react-spring.io/), an amazing library for easily producing animations
- [English Sanguosha](http://www.englishsanguosha.com/), for rules, resources, and translations
- Eva Yeung, Jeff Chen, Michael Wu, Natalle Yu, Tommy Zhang, and Yi-Shiuan Tung for playtesting

