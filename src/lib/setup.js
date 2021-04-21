/**
 * Initial game setup.
 */

import CHARACTERS from './characters.js';
import { ROLE_DIST, ROLE_DIST_LABELS } from './roles.js';

const CARDS = [
    { value: 'A', suit: 'CLUB', type: 'Crossbow' },
    { value: 'A', suit: 'CLUB', type: 'Duel' },
    { value: 'A', suit: 'CLUB', type: 'Silver Helmet' },
    { value: '2', suit: 'CLUB', type: 'Attack' },
    { value: '2', suit: 'CLUB', type: 'Eight Trigrams' },
    { value: '2', suit: 'CLUB', type: 'Black Shield' },
    { value: '2', suit: 'CLUB', type: 'Wood Armor' },
    { value: '3', suit: 'CLUB', type: 'Wine' },
    { value: '3', suit: 'CLUB', type: 'Break' },
    { value: '3', suit: 'CLUB', type: 'Attack' },
    { value: '4', suit: 'CLUB', type: 'Starvation' },
    { value: '4', suit: 'CLUB', type: 'Attack' },
    { value: '4', suit: 'CLUB', type: 'Break' },
    { value: '5', suit: 'CLUB', type: 'Di Lu' },
    { value: '5', suit: 'CLUB', type: 'Attack' },
    { value: '5', suit: 'CLUB', type: 'Lightning Attack' },
    { value: '6', suit: 'CLUB', type: 'Capture' },
    { value: '6', suit: 'CLUB', type: 'Attack' },
    { value: '6', suit: 'CLUB', type: 'Lightning Attack' },
    { value: '7', suit: 'CLUB', type: 'Attack' },
    { value: '7', suit: 'CLUB', type: 'Barbarians' },
    { value: '7', suit: 'CLUB', type: 'Lightning Attack' },
    { value: '8', suit: 'CLUB', type: 'Attack' },
    { value: '8', suit: 'CLUB', type: 'Lightning Attack' },
    { value: '8', suit: 'CLUB', type: 'Attack' },
    { value: '9', suit: 'CLUB', type: 'Attack' },
    { value: '9', suit: 'CLUB', type: 'Wine' },
    { value: '9', suit: 'CLUB', type: 'Attack' },
    { value: '10', suit: 'CLUB', type: 'Chains' },
    { value: '10', suit: 'CLUB', type: 'Attack' },
    { value: '10', suit: 'CLUB', type: 'Attack' },
    { value: 'J', suit: 'CLUB', type: 'Attack' },
    { value: 'J', suit: 'CLUB', type: 'Attack' },
    { value: 'J', suit: 'CLUB', type: 'Chains' },
    { value: 'Q', suit: 'CLUB', type: 'Coerce' },
    { value: 'Q', suit: 'CLUB', type: 'Chains' },
    { value: 'Q', suit: 'CLUB', type: 'Negate' },
    { value: 'K', suit: 'CLUB', type: 'Coerce' },
    { value: 'K', suit: 'CLUB', type: 'Negate' },
    { value: 'K', suit: 'CLUB', type: 'Chains' },
    { value: 'A', suit: 'DIAMOND', type: 'Crossbow' },
    { value: 'A', suit: 'DIAMOND', type: 'Duel' },
    { value: 'A', suit: 'DIAMOND', type: 'Fire Fan' },
    { value: '2', suit: 'DIAMOND', type: 'Escape' },
    { value: '2', suit: 'DIAMOND', type: 'Peach' },
    { value: '2', suit: 'DIAMOND', type: 'Escape' },
    { value: '3', suit: 'DIAMOND', type: 'Steal' },
    { value: '3', suit: 'DIAMOND', type: 'Peach' },
    { value: '3', suit: 'DIAMOND', type: 'Escape' },
    { value: '4', suit: 'DIAMOND', type: 'Steal' },
    { value: '4', suit: 'DIAMOND', type: 'Fire Attack' },
    { value: '4', suit: 'DIAMOND', type: 'Escape' },
    { value: '5', suit: 'DIAMOND', type: 'Fire Attack' },
    { value: '5', suit: 'DIAMOND', type: 'Axe' },
    { value: '5', suit: 'DIAMOND', type: 'Escape' },
    { value: '6', suit: 'DIAMOND', type: 'Attack' },
    { value: '6', suit: 'DIAMOND', type: 'Escape' },
    { value: '6', suit: 'DIAMOND', type: 'Escape' },
    { value: '7', suit: 'DIAMOND', type: 'Attack' },
    { value: '7', suit: 'DIAMOND', type: 'Escape' },
    { value: '7', suit: 'DIAMOND', type: 'Escape' },
    { value: '8', suit: 'DIAMOND', type: 'Escape' },
    { value: '8', suit: 'DIAMOND', type: 'Escape' },
    { value: '8', suit: 'DIAMOND', type: 'Attack' },
    { value: '9', suit: 'DIAMOND', type: 'Attack' },
    { value: '9', suit: 'DIAMOND', type: 'Escape' },
    { value: '9', suit: 'DIAMOND', type: 'Wine' },
    { value: '10', suit: 'DIAMOND', type: 'Escape' },
    { value: '10', suit: 'DIAMOND', type: 'Escape' },
    { value: '10', suit: 'DIAMOND', type: 'Attack' },
    { value: 'J', suit: 'DIAMOND', type: 'Escape' },
    { value: 'J', suit: 'DIAMOND', type: 'Escape' },
    { value: 'J', suit: 'DIAMOND', type: 'Escape' },
    { value: 'Q', suit: 'DIAMOND', type: 'Blaze' },
    { value: 'Q', suit: 'DIAMOND', type: 'Negate' },
    { value: 'Q', suit: 'DIAMOND', type: 'Peach' },
    { value: 'Q', suit: 'DIAMOND', type: 'Sky Scorcher' },
    { value: 'K', suit: 'DIAMOND', type: 'Hua Liu' },
    { value: 'K', suit: 'DIAMOND', type: 'Attack' },
    { value: 'K', suit: 'DIAMOND', type: 'Zi Xing' },
    { value: 'A', suit: 'HEART', type: 'Negate' },
    { value: 'A', suit: 'HEART', type: 'Hail of Arrows' },
    { value: 'A', suit: 'HEART', type: 'Peach Garden' },
    { value: '2', suit: 'HEART', type: 'Escape' },
    { value: '2', suit: 'HEART', type: 'Escape' },
    { value: '2', suit: 'HEART', type: 'Blaze' },
    { value: '3', suit: 'HEART', type: 'Blaze' },
    { value: '3', suit: 'HEART', type: 'Harvest' },
    { value: '3', suit: 'HEART', type: 'Peach' },
    { value: '4', suit: 'HEART', type: 'Harvest' },
    { value: '4', suit: 'HEART', type: 'Fire Attack' },
    { value: '4', suit: 'HEART', type: 'Peach' },
    { value: '5', suit: 'HEART', type: 'Peach' },
    { value: '5', suit: 'HEART', type: 'Longbow' },
    { value: '5', suit: 'HEART', type: 'Red Hare' },
    { value: '6', suit: 'HEART', type: 'Peach' },
    { value: '6', suit: 'HEART', type: 'Capture' },
    { value: '6', suit: 'HEART', type: 'Peach' },
    { value: '7', suit: 'HEART', type: 'Peach' },
    { value: '7', suit: 'HEART', type: 'Draw Two' },
    { value: '7', suit: 'HEART', type: 'Fire Attack' },
    { value: '8', suit: 'HEART', type: 'Escape' },
    { value: '8', suit: 'HEART', type: 'Draw Two' },
    { value: '8', suit: 'HEART', type: 'Peach' },
    { value: '9', suit: 'HEART', type: 'Peach' },
    { value: '9', suit: 'HEART', type: 'Escape' },
    { value: '9', suit: 'HEART', type: 'Draw Two' },
    { value: '10', suit: 'HEART', type: 'Attack' },
    { value: '10', suit: 'HEART', type: 'Attack' },
    { value: '10', suit: 'HEART', type: 'Fire Attack' },
    { value: 'J', suit: 'HEART', type: 'Attack' },
    { value: 'J', suit: 'HEART', type: 'Escape' },
    { value: 'J', suit: 'HEART', type: 'Draw Two' },
    { value: 'Q', suit: 'HEART', type: 'Escape' },
    { value: 'Q', suit: 'HEART', type: 'Peach' },
    { value: 'Q', suit: 'HEART', type: 'Lightning' },
    { value: 'Q', suit: 'HEART', type: 'Break' },
    { value: 'K', suit: 'HEART', type: 'Escape' },
    { value: 'K', suit: 'HEART', type: 'Negate' },
    { value: 'K', suit: 'HEART', type: 'Storm Runner' },
    { value: 'A', suit: 'SPADE', type: 'Ancient Scimitar' },
    { value: 'A', suit: 'SPADE', type: 'Duel' },
    { value: 'A', suit: 'SPADE', type: 'Lightning' },
    { value: '2', suit: 'SPADE', type: 'Ice Sword' },
    { value: '2', suit: 'SPADE', type: 'Gender Swords' },
    { value: '2', suit: 'SPADE', type: 'Eight Trigrams' },
    { value: '2', suit: 'SPADE', type: 'Wood Armor' },
    { value: '3', suit: 'SPADE', type: 'Wine' },
    { value: '3', suit: 'SPADE', type: 'Break' },
    { value: '3', suit: 'SPADE', type: 'Steal' },
    { value: '4', suit: 'SPADE', type: 'Break' },
    { value: '4', suit: 'SPADE', type: 'Lightning Attack' },
    { value: '4', suit: 'SPADE', type: 'Steal' },
    { value: '5', suit: 'SPADE', type: 'Shadow Runner' },
    { value: '5', suit: 'SPADE', type: 'Lightning Attack' },
    { value: '5', suit: 'SPADE', type: 'Green Dragon Blade' },
    { value: '6', suit: 'SPADE', type: 'Black Pommel' },
    { value: '6', suit: 'SPADE', type: 'Capture' },
    { value: '6', suit: 'SPADE', type: 'Lightning Attack' },
    { value: '7', suit: 'SPADE', type: 'Barbarians' },
    { value: '7', suit: 'SPADE', type: 'Lightning Attack' },
    { value: '7', suit: 'SPADE', type: 'Attack' },
    { value: '8', suit: 'SPADE', type: 'Attack' },
    { value: '8', suit: 'SPADE', type: 'Attack' },
    { value: '8', suit: 'SPADE', type: 'Lightning Attack' },
    { value: '9', suit: 'SPADE', type: 'Attack' },
    { value: '9', suit: 'SPADE', type: 'Attack' },
    { value: '9', suit: 'SPADE', type: 'Wine' },
    { value: '10', suit: 'SPADE', type: 'Attack' },
    { value: '10', suit: 'SPADE', type: 'Attack' },
    { value: '10', suit: 'SPADE', type: 'Starvation' },
    { value: 'J', suit: 'SPADE', type: 'Chains' },
    { value: 'J', suit: 'SPADE', type: 'Steal' },
    { value: 'J', suit: 'SPADE', type: 'Negate' },
    { value: 'Q', suit: 'SPADE', type: 'Serpent Spear' },
    { value: 'Q', suit: 'SPADE', type: 'Chains' },
    { value: 'Q', suit: 'SPADE', type: 'Break' },
    { value: 'K', suit: 'SPADE', type: 'Da Yuan' },
    { value: 'K', suit: 'SPADE', type: 'Negate' },
    { value: 'K', suit: 'SPADE', type: 'Barbarians' },
];

export default function setup(ctx, setupData) {
    const { numPlayers, playOrder, random } = ctx;
    const expansions = (setupData || {}).expansions || [];

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

    const allCharacters = CHARACTERS.filter(c => c.expansion === undefined || expansions.includes(c.expansion));
    const numCharacterChoices = 3 * (numPlayers + 1) <= allCharacters.length ? 3 : 2;
    const monarchChoices = random.Shuffle(allCharacters.filter(c => c.isMonarch));
    const normalCharacters = random.Shuffle(allCharacters.filter(c => !monarchChoices.includes(c)));
    const characterChoices = Object.fromEntries(playOrder.map((player, i) =>
        [player, normalCharacters.slice(numCharacterChoices * i, numCharacterChoices * (i + 1))]));
    characterChoices[playOrder[startPlayerIndex]].push(...monarchChoices.slice(0, numCharacterChoices));
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
    const isChained = {};
    const isFlipped = {};
    const harvest = [];
    const privateZone = [];
    const refusingDeath = [1];

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
        isChained,
        isFlipped,
        harvest,
        privateZone,
        refusingDeath,
    };
}
