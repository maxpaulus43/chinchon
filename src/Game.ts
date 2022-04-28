import { Game, Ctx, Move } from "boardgame.io";
import { INVALID_MOVE, PlayerView } from "boardgame.io/core";
import { canMeldWithCard as canMeldWithCard } from "./MeldLogic";
import {
  CardSuit,
  ChinchonCard,
  ChinchonCtx,
  ChinchonGameState,
  ChinchonStage,
  Players,
} from "./Model";

// const AllCards = (() => {
//   const obj: { [key: string]: ChinchonCard } = {};
//   const cards = makeDeck();
//   for (const c of cards) {
//     obj[`${c.symbol}${c.suit}`] = c;
//   }
//   return obj;
// })();

const drawCardFromDrawPile: Move<ChinchonGameState> = (G, ctx) => {
  const theCard = G.drawPile.pop();
  if (!theCard) {
    return INVALID_MOVE;
  }
  G.players[ctx.currentPlayer].hand.push(theCard);
  ctx.events?.endStage();
};

const drawCardFromDiscardPile: Move<ChinchonGameState> = (G, ctx) => {
  const theCard = G.discardPile.pop();
  if (!theCard) {
    return INVALID_MOVE;
  }
  G.players[ctx.currentPlayer].hand.push(theCard);
  ctx.events?.endStage();
};

const discardCard: Move<ChinchonGameState> = (
  G,
  ctx,
  theCard: ChinchonCard
) => {
  let hand = G.players[ctx.playOrderPos].hand;
  const idx = hand.findIndex((c) => c.ordinal === theCard.ordinal);
  if (idx < 0) {
    return INVALID_MOVE;
  }
  G.discardPile.push(hand.splice(idx, 1)[0]);
  ctx.events?.endTurn();
};

const meldHandWithCard: Move<ChinchonGameState> = (
  G,
  ctx,
  card: ChinchonCard
) => {
  const hand = G.players[ctx.currentPlayer].hand;
  if (!canMeldWithCard(hand, card)) {
    return INVALID_MOVE;
  }
  // TODO possibly score points here
  ctx.events?.endGame();
};

export const Chinchon: Game<ChinchonGameState, ChinchonCtx> = {
  setup: (ctx) => {
    let deck = ctx.random!.Shuffle(makeDeck());
    let players = makePlayers(ctx);
    for (let player of Object.values(players)) {
      player.hand.push(...deck.splice(0, 7));
    }
    return {
      drawPile: deck,
      discardPile: [],
      players: players,
    };
  },
  turn: {
    activePlayers: {
      currentPlayer: ChinchonStage.Draw,
    },
    stages: {
      [ChinchonStage.Draw]: {
        moves: { drawCardFromDrawPile, drawCardFromDiscardPile },
        next: ChinchonStage.Discard,
      },
      [ChinchonStage.Discard]: {
        moves: { discardCard, meldHandWithCard },
      },
    },
  },
  moves: {
    drawCardFromDrawPile,
    drawCardFromDiscardPile,
    discardCard,
    meldHandWithCard,
  },
  playerView: (G, ctx, playerID) => {
    // improve this so that players can see how many cards are in other players hands and their points
    return PlayerView.STRIP_SECRETS(G, ctx, playerID);
  },
};

function makeDeck(): ChinchonCard[] {
  const symbols = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ];
  const pointValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10];
  const suits = Object.values(CardSuit);
  const cards: ChinchonCard[] = [];
  for (let i = 0; i < symbols.length; i++) {
    for (const suit of suits) {
      cards.push({
        id: `${symbols[i]}${suit}`,
        ordinal: i + 1, // better if the ordinal matches with card value. e.g. 1 == Ace
        suit: suit,
        pointValue: pointValues[i],
        symbol: symbols[i],
      });
    }
  }
  // push jokers separately
  cards.push(
    {
      id: `Jo${CardSuit.Heart}`,
      ordinal: 14,
      symbol: "Jo",
      suit: CardSuit.Heart,
      pointValue: 50,
    },
    {
      id: `Jo${CardSuit.Spade}`,
      ordinal: 15,
      symbol: "Jo",
      suit: CardSuit.Spade,
      pointValue: 50,
    }
  );
  return cards;
}

function makePlayers(ctx: Ctx): Players {
  let players: Players = {};
  for (let p of ctx.playOrder) {
    players[p] = {
      hand: [],
      points: 0,
      didBuyIn: false,
    };
  }
  return players;
}
