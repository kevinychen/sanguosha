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

const CARDS = [
    { value: '10', suit: 'CLUB', type: 'Attack' },
    { value: '7', suit: 'DIAMOND', type: 'Dodge' },
    { value: 'Q', suit: 'HEART', type: 'Peach' },
    { value: '4', suit: 'DIAMOND', type: 'Fire Attack' },
    { value: '6', suit: 'CLUB', type: 'Lightning Attack' },
    { value: '3', suit: 'CLUB', type: 'Wine' },
    { value: '7', suit: 'CLUB', type: 'Barbarians' },
    { value: 'A', suit: 'HEART', type: 'Hail of Arrows' },
    { value: 'A', suit: 'HEART', type: 'Peach Garden' },
    { value: '3', suit: 'HEART', type: 'Harvest' },
    { value: '7', suit: 'HEART', type: 'Draw Two' },
    { value: 'Q', suit: 'DIAMOND', type: 'Negate' },
    { value: '4', suit: 'SPADE', type: 'Break' },
    { value: 'A', suit: 'SPADE', type: 'Duel' },
    { value: 'Q', suit: 'CLUB', type: 'Coerce' },
    { value: '4', suit: 'DIAMOND', type: 'Steal' },
    { value: '3', suit: 'HEART', type: 'Blaze' },
    { value: 'K', suit: 'CLUB', type: 'Chains' },
    { value: 'A', suit: 'CLUB', type: 'Crossbow' },
    { value: '6', suit: 'SPADE', type: 'Black Pommel' },
    { value: '2', suit: 'SPADE', type: 'Ice Sword' },
    { value: '2', suit: 'SPADE', type: 'Gender Swords' },
    { value: '5', suit: 'SPADE', type: 'Green Dragon Blade' },
    { value: 'Q', suit: 'SPADE', type: 'Serpent Spear' },
    { value: '5', suit: 'DIAMOND', type: 'Axe' },
    { value: 'Q', suit: 'DIAMOND', type: 'Sky Scorcher' },
    { value: '5', suit: 'HEART', type: 'Longbow' },
    { value: 'A', suit: 'SPADE', type: 'Ancient Simitar' },
    { value: 'A', suit: 'DIAMOND', type: 'Fire Fan' },
    { value: '2', suit: 'SPADE', type: 'Eight Trigrams' },
    { value: '2', suit: 'CLUB', type: 'Black Shield' },
    { value: '2', suit: 'SPADE', type: 'Wood Armor' },
    { value: 'A', suit: 'CLUB', type: 'Silver Helmet' },
    { value: '5', suit: 'HEART', type: 'Red Hare' },
    { value: 'K', suit: 'SPADE', type: 'Da Yuan' },
    { value: 'K', suit: 'DIAMOND', type: 'Zi Xing' },
    { value: '5', suit: 'CLUB', type: 'Di Lu' },
    { value: '5', suit: 'SPADE', type: 'Shadow Runner' },
    { value: 'K', suit: 'HEART', type: 'Storm Runner' },
    { value: 'K', suit: 'DIAMOND', type: 'Hua Liu' },
];

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

    const unshuffledDeck = CARDS.map(card => { return { ...card } });
    const deck = random.Shuffle(unshuffledDeck);
    for (let i = 0; i < deck.length; i++) {
        deck[i].id = `card-${i}`;
    }
    const discard = [];

    const hands = Object.fromEntries(playOrder.map(player => [player, []]));
    const equipment = Object.fromEntries(playOrder.map(player => [player, {}]));
    const harvest = [];

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
        equipment,
        harvest,
    };
}
