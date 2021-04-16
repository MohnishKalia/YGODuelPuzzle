// @ts-check

// @ts-expect-error
import { nanoid } from 'https://cdn.jsdelivr.net/npm/nanoid/nanoid.js';

/**
 * @param {string} cardName
 */
async function getCardInfo(cardName) {
    const res = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${cardName}`);
    const json = await res.json();
    return json;
}

/**
 * @param {string} message
 */
async function digestMessage(message) {
    // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
    const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
    return hashHex;
}

let initialPassword = 'Riding Duel, Acceleration!';

class Card {
    /**
     * @param {string} name card name
     * @param {string} targetHash target hash value (based on what the target for a card is, like Green Gadget)
     * @param {string} activateHash activate hash value (based on if the card is activated, like Tribute to the Doomed)
     * @param {string} gyHash graveyard hash value (when its sent to the graveyard, after activation or discard, like Remove Trap)
     */
    constructor(name, targetHash, activateHash, gyHash) {
        /** @type {string} */
        this.id = nanoid();

        this.name = name;
        
        this.init(targetHash, activateHash, gyHash);
    }
    
    /**
     * 
     * @param {string} targetHash target hash value (based on what the target for a card is, like Green Gadget)
     * @param {string} activateHash activate hash value (based on if the card is activated, like Tribute to the Doomed)
     * @param {string} gyHash graveyard hash value (when its sent to the graveyard, after activation or discard, like Remove Trap)
     */
    async init(targetHash, activateHash, gyHash) {
        const json = await getCardInfo(this.name);
        this.imgUrl = json.data[0].card_images[0].image_url;
        this.targetHash = await digestMessage(targetHash);
        this.activateHash = await digestMessage(activateHash);
        this.gyHash = await digestMessage(gyHash);
    }

}

const allCards = [
    new Card('Green Gadget', 'monGGtar', 'monGGact', 'monGGgy'),
    new Card('Red Gadget', 'monRGtar', 'monRGact', 'monRGgy'),
    new Card('Yellow Gadget', 'monYGtar', 'monYGact', 'monYGgy'),
    new Card('Ancient Gear Soldier', 'monAGtar', 'monAGact', 'monAGgy'),
    new Card('Stronghold the Moving Fortress', 'trapSFtar', 'trapSFact', 'trapSFgy'),
    new Card('The Dark Door', 'trapTDtar', 'trapTDact', 'trapTDgy'),
    new Card('Mirror Force', 'trapMFtar', 'trapMFact', 'trapMFgy'),
    new Card('Tragoedia', 'monTRtar', 'monTRact', 'monTRgy'),
    new Card('Axe of Despair', 'spellADtar', 'spellADact', 'spellADgy'),
    new Card('Remove Trap', 'spellRTtar', 'spellRTact', 'spellRTgy'),
    new Card('Cost Down', 'spellCDtar', 'spellCDact', 'spellCDgy'),
    new Card('Tribute to the Doomed', 'spellTDtar', 'spellTDact', 'spellTDgy'),
    new Card('Shooting Star Bow - Ceal', 'spellSBtar', 'spellSBact', 'spellSBgy'),
    new Card('Alector, Sovereign of Birds', 'monABtar', 'monABact', 'monABgy'),
];

const [gg, rg, yg, ags, smf, tdd, mf, t, ad, rt, cd, td, ssbc, asb] = allCards;

// console.log({gg, rg, yg, ags, smf, tdd, mf, t, ad, rt, cd, td, ssbc, asb});

/**
 * @typedef Zones
 * @type {FixedLengthArray<[Card, Card, Card, Card, Card]>}
 */

/**
 * @typedef Field
 * @type {Object}
 * @property {Zones} monsters
 * @property {Zones} backrow
 * @property {Card[]} gy
 */

/**
 * @typedef PlayerInfo
 * @type {Object}
 * @property {number} lp
 * @property {Card[]} hand
 * @property {Field} field
 */

/**
 * @typedef GameState
 * @type {Object}
 * @property {PlayerInfo} client
 * @property {PlayerInfo} opp
 */

/** @type {Readonly<GameState>} */
const initialGameState = Object.freeze({
    client: {
        lp: 1000,
        hand: [ad, rt, cd, td, ssbc, asb],
        field: {
            monsters: [null, null, t, null, null],
            backrow: [null, null, null, null, null],
            gy: []
        }
    },
    opp: {
        lp: 2300,
        hand: [],
        field: {
            monsters: [rg, yg, gg, ags, smf],
            backrow: [null, null, mf, tdd, null],
            gy: []
        }
    }
});

/** @type {GameState} */
const gameState = JSON.parse(JSON.stringify(initialGameState));

console.log(gameState);
