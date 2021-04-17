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

class Card {
    /**
     * @param {string} id
     * @param {string} name
     * @param {string} imgUrl
     * @param {string} targetHash
     * @param {string} activateHash
     * @param {string} gyHash
     */
    constructor(id, name, imgUrl, targetHash, activateHash, gyHash) {
        this.id = id;
        this.name = name;
        this.imgUrl = imgUrl;
        this.targetHash = targetHash;
        this.activateHash = activateHash;
        this.gyHash = gyHash;
    }

    /**
     * @param {string} name card name
     * @param {string} targetHash target hash value (based on what the target for a card is, like Green Gadget)
     * @param {string} activateHash activate hash value (based on if the card is activated, like Tribute to the Doomed)
     * @param {string} gyHash graveyard hash value (when its sent to the graveyard, after activation or discard, like Remove Trap)
     */
    static async createAsync(name, targetHash, activateHash, gyHash) {
        const id = nanoid();
        const json = await getCardInfo(name);
        const imgUrl = json.data[0].card_images[0].image_url;
        const targetHash2 = await digestMessage(targetHash);
        const activateHash2 = await digestMessage(activateHash);
        const gyHash2 = await digestMessage(gyHash);
        return new this(id, name, imgUrl, targetHash2, activateHash2, gyHash2);
    }
}

(async () => {
    
    const allCards = await Promise.all([
        Card.createAsync('Green Gadget', 'monGGtar', 'monGGact', 'monGGgy'),
        Card.createAsync('Red Gadget', 'monRGtar', 'monRGact', 'monRGgy'),
        Card.createAsync('Yellow Gadget', 'monYGtar', 'monYGact', 'monYGgy'),
        Card.createAsync('Ancient Gear Soldier', 'monAGtar', 'monAGact', 'monAGgy'),
        Card.createAsync('Stronghold the Moving Fortress', 'trapSFtar', 'trapSFact', 'trapSFgy'),
        Card.createAsync('The Dark Door', 'trapTDtar', 'trapTDact', 'trapTDgy'),
        Card.createAsync('Mirror Force', 'trapMFtar', 'trapMFact', 'trapMFgy'),
        Card.createAsync('Tragoedia', 'monTRtar', 'monTRact', 'monTRgy'),
        Card.createAsync('Axe of Despair', 'spellADtar', 'spellADact', 'spellADgy'),
        Card.createAsync('Remove Trap', 'spellRTtar', 'spellRTact', 'spellRTgy'),
        Card.createAsync('Cost Down', 'spellCDtar', 'spellCDact', 'spellCDgy'),
        Card.createAsync('Tribute to the Doomed', 'spellTDtar', 'spellTDact', 'spellTDgy'),
        Card.createAsync('Shooting Star Bow - Ceal', 'spellSBtar', 'spellSBact', 'spellSBgy'),
        Card.createAsync('Alector, Sovereign of Birds', 'monABtar', 'monABact', 'monABgy'),
    ]);
    
    const [gg, rg, yg, ags, smf, tdd, mf, t, ad, rt, cd, td, ssbc, asb] = allCards;
    // console.log({gg, rg, yg, ags, smf, tdd, mf, t, ad, rt, cd, td, ssbc, asb});
    
    const initialPassword = 'Riding Duel, Acceleration!';
    
    /** @type {Readonly<GameState>} */
    // @ts-expect-error
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

    function startGame() {
        let password = initialPassword.toString();

        /** @type {GameState} */
        const gameState = JSON.parse(JSON.stringify(initialGameState));
        console.log({ password, gameState });

        /**
         * @param {Card} card
         * @param {keyof GameState} who
         */
        async function gyCard(card, who) {
            // gameState[who].field.gy.push(card);
            password = await digestMessage(card.gyHash + password);
            // render();
        }

        /**
         * @param {Card} card
         */
        async function targetCard(card) {
            password = await digestMessage(card.targetHash + password);
        }

        /**
         * @param {Card} card
         * @param {keyof GameState} who
         */
        async function activateCard(card, who) {
            // gameState[who].field.gy.push(card);
            password = await digestMessage(card.activateHash + password);
            // render();
        }

    }

    startGame();

    function render() {
        throw new Error('Function not implemented.');
    }
    
})();
