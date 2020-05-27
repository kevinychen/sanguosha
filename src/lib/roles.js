// Recommended role distribution for different numbers of players
// http://www.englishsanguosha.com/rules/roles
export const ROLE_DIST_LABELS = ['King', 'Rebel', 'Loyalist', 'Spy'];
export const ROLE_DIST = {
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
