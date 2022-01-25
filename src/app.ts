import { Card, Maybe, Set } from "mtggraphql";

var fs = require('fs');
var _ = require('lodash');
var { buildSchema } = require('graphql'); 

const allPrintingsFile = fs.readFileSync('./data/AllPrintings.json', 'utf8')
const ALL_PRINTINGS_JSON = JSON.parse(allPrintingsFile);
  
// The root provides a resolver function for each API endpoint
interface CardNameSearchResponse {
    card: Card
    setId: string
}

const findInString = (subString: string, stringToSearch: string): Boolean => {
    const lowerCaseSubstring = subString.toLowerCase();
    const lowerCaseStringToSearch = stringToSearch.toLowerCase();

    return -1 != lowerCaseStringToSearch.indexOf(lowerCaseSubstring);
} 

const filterCardByCardName = (cardName: string, card: Card): "" | Boolean | null | undefined => {
    const foundInFaceName = card.faceName && findInString(cardName, card.faceName);
    const foundInName = card.name && findInString(cardName, card.name);
    
    return foundInFaceName || foundInName;
}

const getCardByCardName = ({cardName}: any): [CardNameSearchResponse] => {
    var allSets: any = ALL_PRINTINGS_JSON['data']

    const testResult =_.reduce(allSets, (result: [CardNameSearchResponse], set: Set, key: string): [CardNameSearchResponse] => {
        _(set.cards)
        .filter((card: Card) => filterCardByCardName(cardName, card))
        .forEach((card: Card) => {
            const cardRes: CardNameSearchResponse = { setId: key, card };

            result.push(cardRes);
        });
        
        return result;
    }, []);

    const unique: [CardNameSearchResponse] = _.uniq(testResult);

    return unique;
}

const getCardsBySet = (setName: string) => {
    const allSets = ALL_PRINTINGS_JSON['data'];
    const matchingSet = allSets[setName];

    if(matchingSet) {
        const cards = matchingSet['cards'];
        
        const cardsInSet = _.reduce(cards, function(result: any, card: any) {
            if(card && card.name) {
                result.push(card.name);
            }

            return result
        }, []);

        return cardsInSet
    } else {
        return []
    }
}

const getSets = (setName: string) => {
    const allSets = ALL_PRINTINGS_JSON['data'];

    if(allSets) {
        return Object.keys(allSets)
    } else {
        return []
    }
}



// export const schema = buildSchema(`
//     type CarNameSearchResponse {
//         cardName: String
//         setName: String!
//         uuid: String!
//     }

//     type Query {
//     getCardByCardName(cardName: String!): [CarNameSearchResponse]
//     getCardsBySet(setName: String!): [String]
//     getSets(setName: String!): [String]
//     }
// `);

export const root = {
    getCardByCardName,
    getCardsBySet,
    getSets,
};

export const schema = buildSchema(
`
enum LegalitiesFormat {
    Brawl
    Commander
    Duel
    Frontier
    Future
    Legacy
    Modern
    Pauper
    Penny
    Pioneer
    Standard
    Vintage
}

type Card {
    typename: String
    artist: String
    asciiName: String
    availability: [String]
    borderColor: String
    colorIdentity: [String]
    colorIndicator: [String]
    colors: [String]
    convertedManaCost: Float
    count: Float
    duelDeck: String
    edhrecRank: Float
    faceConvertedManaCost: Float
    faceName: String
    flavorName: String
    flavorText: String
    foreignData: [ForeignData]
    frameEffects: [String]
    frameVersion: String
    hand: String
    hasAlternativeDeckLimit: Boolean
    hasContentWarning: Boolean
    hasFoil: Boolean
    hasNonFoil: Boolean
    id: String
    identifiers: Identifier
    isAlternative: Boolean
    isFoil: Boolean
    isFullArt: Boolean
    isOnlineOnly: Boolean
    isOversized: Boolean
    isPromo: Boolean
    isReprint: Boolean
    isReserved: Boolean
    isStarter: Boolean
    isStorySpotlight: Boolean
    isTextless: Boolean
    isTimeshifted: Boolean
    keywords: [String]
    layout: String
    leadershipSkills: LeadershipSkills
    legalities: Legalities
    life: String
    loyalty: String
    manaCost: String
    name: String
    number: String
    originalText: String
    originalType: String
    otherFaceIds: [String]
    power: String
    printings: [String]
    promoTypes: [String]
    purchaseUrls: PurchaseUrls
    rarity: String
    rulings: Rulings
    setCode: String
    side: String
    subTypes: [String]
    superTypes: [String]
    text: String
    toughness: String
    type: String
    types: [String]
    uuid: String!
    variation: [String]
    watermark: String
}

type ForeignData {
    typename: String!
    faceName: String
    flavorText: String
    language: String!
    multiverseId: String
    name: String
    text: String
    type: String
}

type Identifier {
    typename: String!
    cardKingdomFoilId: String
    cardKingdomId: String
    mcmId: String
    mcmMetaId: String
    mtgArenaId: String
    mtgjsonV4Id: String!
    mtgoFoilId: String
    mtgoId: String
    multiverseId: String
    scryfallId: String!
    scryfallIllustrationId: String
    scryfallOracleId: String
    tcgplayerProductId: String
}

type LeadershipSkills {
    typename: String!
    brawl: Boolean
    commander: Boolean
    oathbreaker: Boolean
}

type Legalities {
    typename: String!
    format: LegalitiesFormat
    status: String
    uuid: Card
}

type PurchaseUrls {
    typename: String!
    cardKingdom: String
    cardKingdomFoil: String
    cardmarket: String
    tcgplayer: String
}

type Rulings {
    typename: String!
    date: String
    text: String
}

type CardNameSearchResponse {
    card: Card!
    setId: String!
}

type Query {
    getCardByCardName(cardName: String!): [CardNameSearchResponse]
    getCardsBySet(setName: String!): [String]
    getSets(setName: String!): [String]
}
`
);