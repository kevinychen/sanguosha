/**
 * Initial game setup.
 */

import CHARACTERS from './characters.js';

// Recommended role distribution for different numbers of players
// http://www.englishsanguosha.com/rules/roles
const ROLE_DIST_LABELS = ['King', 'Rebel', 'Loyalist', 'Spy'];
const ROLE_DIST = {
    2: [1, 1, 0, 0],
    3: [1, 1, 0, 1],
    4: [1, 2, 0, 1],
    5: [1, 2, 1, 1],
    6: [1, 3, 1, 1],
    7: [1, 3, 2, 1],
    8: [1, 4, 2, 1],
    9: [1, 4, 3, 1],
    10: [1, 5, 3, 1],
};

const NUM_CHARACTER_CHOICES = 3;

export default function setup(ctx) {
    const { numPlayers, playOrder, random } = ctx;

    const unshuffledRoles = [];
    ROLE_DIST_LABELS.forEach((role, i) => {
        for (let j = 0; j < ROLE_DIST[numPlayers][i]; j++) {
            unshuffledRoles.push({ name: role });
        }
    });
    const roles = random.Shuffle(unshuffledRoles);
    for (let i = 0; i < roles.length; i++) {
        roles[i].id = `role-${i}`;
    }
    const startPlayerIndex = roles.findIndex(role => role.name === 'King');

    const allCharacterChoices = random.Shuffle(CHARACTERS);
    const characterChoices = Object.fromEntries(playOrder.map((player, i) =>
        [player, allCharacterChoices.slice(NUM_CHARACTER_CHOICES * i, NUM_CHARACTER_CHOICES * (i + 1))]));
    const characters = {};
    const healths = {};
    const isAlive = Object.fromEntries(playOrder.map(player => [player, true]));

    const unshuffledDeck = [];
    // TODO add all the cards!?!?
    for (let i = 0; i < 5; i++) {
        unshuffledDeck.push({ value: '10', suit: 'CLUB', type: 'Attack' });
    }
    for (let i = 0; i < 5; i++) {
        unshuffledDeck.push({ value: '7', suit: 'DIAMOND', type: 'Dodge' });
    }
    for (let i = 0; i < 5; i++) {
        unshuffledDeck.push({ value: 'Q', suit: 'HEART', type: 'Peach' });
    }
    for (let i = 0; i < 5; i++) {
        unshuffledDeck.push({ value: '7', suit: 'CLUB', type: 'Barbarians' });
    }
    for (let i = 0; i < 5; i++) {
        unshuffledDeck.push({ value: 'A', suit: 'HEART', type: 'Hail of Arrows' });
    }
    for (let i = 0; i < 5; i++) {
        unshuffledDeck.push({ value: 'A', suit: 'HEART', type: 'Peach Garden' });
    }
    const deck = random.Shuffle(unshuffledDeck);
    for (let i = 0; i < deck.length; i++) {
        deck[i].id = `card-${i}`;
    }
    const discard = [];

    const hands = Object.fromEntries(playOrder.map(player => [player, []]));

    return {
        roles,
        startPlayerIndex,
        characterChoices,
        characters,
        healths,
        isAlive,
        deck,
        discard,
        hands,
    };
}
