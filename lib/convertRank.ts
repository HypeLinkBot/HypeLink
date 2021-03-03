const ranks = {
    "ADMIN": [
        [
            'c',
            "[ADMIN]"
        ]
    ],
    "MODERATOR": [
        [
            '2',
            "[MOD]"
        ]
    ],
    "HELPER": [
        [
            '9',
            "[HELPER]"
        ]
    ],
    "JR_HELPER": [
        [
            '9',
            "[JR HELPER]"
        ]
    ],
    "YOUTUBER": [
        [
            'c',
            "["
        ],
        [
            'f',
            "YOUTUBE"
        ],
        [
            'c',
            "]"
        ]
    ],
    "SUPERSTAR": [
        [
            "%r",
            "[MVP"
        ],
        [
            "%p",
            "++"
        ],
        [
            "%r",
            "]"
        ]
    ],
    "MVP_PLUS": [
        [
            'b',
            "[MVP"
        ],
        [
            "%p",
            "+"
        ],
        [
            'b',
            "]"
        ]
    ],
    "MVP": [
        [
            'b',
            "[MVP]"
        ]
    ],
    "VIP_PLUS": [
        [
            'a',
            "[VIP"
        ],
        [
            '6',
            "+"
        ],
        [
            'a',
            "]"
        ]
    ],
    "VIP": [
        [
            'a',
            "[VIP]"
        ]
    ],
    "DEFAULT": null
};

/**
 * Calculate the rank tag for the player object from the Hypixel API
 * @param player Player object from Hypixel API
 * @returns {*} Tag as an object like in {@link ranks}
 */
function calcTag(player) {
    if (player && typeof player === "object") {
        // In order of least priority to highest priority
        let packageRank = player.packageRank;
        let newPackageRank = player.newPackageRank;
        let monthlyPackageRank = player.monthlyPackageRank;
        let rank = player.rank;

        if (rank === "NORMAL") rank = null;
        if (monthlyPackageRank === "NONE") monthlyPackageRank = null;
        if (packageRank === "NONE") packageRank = null;
        if (newPackageRank === "NONE") newPackageRank = null;

        //if (prefix && typeof prefix == "string") return prefix;
        if (rank || monthlyPackageRank || newPackageRank || packageRank) return rank || monthlyPackageRank || newPackageRank || packageRank;
        /*
        if (prefix && typeof prefix === "string") return parseMinecraftTag(prefix);
        if (rank || monthlyPackageRank || newPackageRank || packageRank) return replaceCustomColors(ranks[rank || monthlyPackageRank || newPackageRank || packageRank], colors[rankPlusColor], colors[monthlyRankColor]);
        */
    }
    return replaceCustomColors(ranks.DEFAULT, null, null)
}

const defaultPlusColor = 'c'; // %p
const defaultRankColor = '6'; // %r

/**
 * Replace the custom colors wildcards (%r and %p) with their actual colors in ranks
 * @param rank Rank in the structure found in {@link ranks}
 * @param p Plus color
 * @param r Rank color
 * @returns {*} New rank with real colors
 */
function replaceCustomColors(rank, p, r) {
    if (!(rank instanceof Array))
        return rank;

    // Deep copy the rank
    let newRank = JSON.parse(JSON.stringify(rank));

    // i don't need custom color codes for this so

    // Set defaults
    if (!p || typeof p !== "string" || p.length > 1)
        p = defaultPlusColor;
    if (!r || typeof r !== "string" || r.length > 1)
        r = defaultRankColor;

    // Go through rank and replace wildcards
    newRank.forEach((component) => {
        if (component instanceof Array && component.length >= 2) {
            if (component[0] === "%p")
                component[0] = p;
            if (component[0] === "%r")
                component[0] = r;
        }
    });

    return newRank;
}

module.exports = calcTag;