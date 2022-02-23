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
    setName: undefined | null | string
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

const filterSetBySetCode = (setCode: string, set: Set): "" | Boolean | null | undefined => {
    const foundInCode = set.code && findInString(setCode, set.code)

    return foundInCode
}

const getAllSets = (): any => {
    return ALL_PRINTINGS_JSON['data']
}


const filterByColors = (colors: [string], card: Card): "" | Boolean | null | undefined => {
    const foundInCode = card.colors && _.isEqual(colors.sort(), card.colors.sort())

    return foundInCode
}

interface CardSearchColorFilter {
    colors: [string]
    isExactMatch: Boolean
    isUnselectedColorsExcluded: Boolean
    isMatchMultiOnly: Boolean
}
interface CardSearchRequest {
    cardName: string
    colorsFilter?: CardSearchColorFilter
}

const getCardByCardName = (cardSearchRequest: CardSearchRequest): [CardNameSearchResponse] => {
    var allSets: any = getAllSets()

    const testResult =_.reduce(allSets, (result: [CardNameSearchResponse], set: Set, key: string): [CardNameSearchResponse] => {
        _(set.cards)
            .filter((card: Card) => {
                // if(cardSearchRequest.cardName) {
                //     return filterCardByCardName(cardSearchRequest.cardName, card)
                // } else if(cardSearchRequest.colorsFilter && cardSearchRequest.colorsFilter.colors) {
                //     return filterByColors(cardSearchRequest.colorsFilter.colors, card)
                // } else {
                //     return false
                // }
                return cardSearchRequest.cardName ? filterCardByCardName(cardSearchRequest.cardName, card) : false
                
            })
            .forEach((card: Card) => {
                const cardRes: CardNameSearchResponse = { 
                    setId: key
                ,   setName: set.name
                ,   card 
                };

                result.push(cardRes);
            });
        
        return result;
    }, []);

    const unique: [CardNameSearchResponse] = _.uniq(testResult);

    return unique;
}

const getSets = ({setCode}: any): [Set] => {
    const allSets: any = getAllSets()

    const testResult = _.reduce(allSets, (result: [Set], set: Set, key: string): [Set] => {
        if(setCode) {
            if(filterSetBySetCode(setCode, set)) {
                result.push(set)
            }
        } else {
            result.push(set)
        }
        
        return result;
    }, []);

    const unique: [Set] = _.uniq(testResult);

    return unique
}

export const root = {
    getCardByCardName,
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

type CardToken {
    artist: String!
    asciiName: String!
    availability: [String]
    borderColor: String!
    colorIdentity: [String]
    colorIndicator: String!
    colors: [String]
    edhrecRank: Float!
    faceName: String!
    flavorText: String!
    frameEffects: [String]
    frameVersion: String!
    hasFoil: Boolean!
    hasNonFoil: Boolean!
    identifiers: Identifier!
    isFullArt: Boolean!
    isOnlineOnly: Boolean!
    isPromo: Boolean!
    isReprint: Boolean!
    keywords: [String]
    layout: String!
    loyalty: String!
    name: String!
    number: String!
    power: String!
    promoTypes: [String]
    reverseRelated: [String]
    setCode: String!
    side: String!
    subTypes: [String]
    text: String!
    toughness: String!
    type: String!
    types: [String]
    uuid: String
    watermark: String!
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

type Translations {
    AncientGreek: String!
    Arabic: String!
    ChineseSimplified: String!
    ChineseTraditional: String!
    French: String!
    German: String!
    Hebrew: String!
    Italian: String!
    Japanese: String!
    Korean: String!
    Latin: String!
    Phyrexian: String!
    PortugueseBrazil: String!
    Russian: String!
    Sanskrit: String!
    Spanish: String!
}

type CardNameSearchResponse {
    card: Card!
    setId: String!
    setName: String!
}

type CardSetSearchResponse {
    baseSetSize: Float!
    block: String!
    cards: [Card]
    code: String!
    codeV3: String!
    id: String
    isFoilOnly: Boolean!
    isForeignOnly: Boolean!
    isNonFoilOnly: Boolean!
    isOnlineOnly: Boolean!
    isPaperOnly: Boolean!
    isPartialPreview: Boolean!
    keyruneCode: String!
    mcmId: Float!
    mcmName: String!
    mtgoCode: String!
    name: String!
    parentCode: String!
    releaseDate: String!
    tcgplayerGroupId: Float!
    tokens: [CardToken]
    totalSetSize: Float!
    translations: Translations!
    type: String!
}

input ColorsFilter {
    colors: [String]
    isExactMatch: Boolean!
    isUnselectedColorsExcluded: Boolean!
    isMatchMultiOnly: Boolean!
}

type Query {
    getCardByCardName(cardName: String!): [CardNameSearchResponse]
    getSets(setCode: String!): [CardSetSearchResponse]
}
`
);




