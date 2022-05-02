import { Game, Ctx, Move } from "boardgame.io";
import { INVALID_MOVE, PlayerView } from "boardgame.io/core";
import { calculatePointsForHand, canMeldWithCard } from "./MeldLogic";
import {
  CardSuit,
  ChinchonCard,
  ChinchonCtx,
  ChinchonGameState,
  ChinchonStage,
  PlayerMap,
} from "./Model";

const drawCardFromDrawPile: Move<ChinchonGameState> = (G, ctx) => {
  const theCard = G.drawPile.pop();
  if (!theCard) {
    return INVALID_MOVE;
  }
  G.playerMap[ctx.currentPlayer].hand.push(theCard);
  ctx.events?.endStage();
};

const drawCardFromDiscardPile: Move<ChinchonGameState> = (G, ctx) => {
  const theCard = G.discardPile.pop();
  if (!theCard) {
    return INVALID_MOVE;
  }
  G.playerMap[ctx.currentPlayer].hand.push(theCard);
  ctx.events?.endStage();
};

const discardCard: Move<ChinchonGameState> = (
  G,
  ctx,
  theCard: ChinchonCard
) => {
  let hand = G.playerMap[ctx.playOrderPos].hand;
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
  meldCard: ChinchonCard
) => {
  const hand = G.playerMap[ctx.currentPlayer].hand;
  if (
    !hand.find((c) => c.id === meldCard.id) ||
    !canMeldWithCard(hand, meldCard)
  ) {
    return INVALID_MOVE;
  }
  hand.splice(
    hand.findIndex((c) => c.id === meldCard.id),
    1
  );

  scoreAndEliminatePlayers(G, ctx);
  // TODO add a phase where players get to see the end board state.
  resetGame(G, ctx);
};

function scoreAndEliminatePlayers(G: ChinchonGameState, ctx?: ChinchonCtx) {
  for (const [pId, player] of Object.entries(G.playerMap)) {
    player.points += calculatePointsForHand(G, player.hand);

    // TODO support buyback logic

    if (player.points >= 30) {
      const idx = G.playOrder.indexOf(pId);
      G.playOrder.splice(idx, 1);
      if (idx < G.playOrderPos) {
        G.playOrderPos--;
      }
    }
  }
}

function resetGame(G: ChinchonGameState, ctx: ChinchonCtx) {
  G.drawPile = ctx.random!.Shuffle(makeDeck());
  for (let player of Object.values(G.playerMap)) {
    player.hand.splice(0, player.hand.length, ...G.drawPile.splice(0, 7));
  }
  G.discardPile = [G.drawPile.pop()!];
}

export const Chinchon: Game<ChinchonGameState, ChinchonCtx> = {
  name: "Chinchon",
  maxPlayers: 4,
  setup: (ctx) => {
    const drawPile = ctx.random!.Shuffle(makeDeck());
    const playerMap = makePlayerMap(ctx);
    for (let player of Object.values(playerMap)) {
      player.hand.push(...drawPile.splice(0, 7));
    }
    const discardPile = [drawPile.pop()!];
    return {
      drawPile,
      discardPile,
      playerMap,
      playOrder: ctx.playOrder,
      playOrderPos: ctx.playOrderPos,
      currentPlayer: ctx.currentPlayer,
    };
  },
  endIf: (G) => {
    if (G.playOrder.length === 1) {
      return G.playOrder[0];
    }
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
    order: {
      first: (G, ctx) => {
        return ctx.playOrder.indexOf(G.playOrder[G.playOrderPos]);
      },
      next: (G, ctx) => {
        return ctx.playOrder.indexOf(G.playOrder[G.playOrderPos]);
      },
    },
    onEnd: (G) => {
      G.playOrderPos = (G.playOrderPos + 1) % G.playOrder.length;
    },
  },
  // phases: {
  //   [ChinchonPhase.Play]: {
  //     start: true,
  //     turn: {
  //       activePlayers: {
  //         currentPlayer: ChinchonStage.Draw,
  //       },
  //       stages: {
  //         [ChinchonStage.Draw]: {
  //           moves: { drawCardFromDrawPile, drawCardFromDiscardPile },
  //           next: ChinchonStage.Discard,
  //         },
  //         [ChinchonStage.Discard]: {
  //           moves: { discardCard, meldHandWithCard },
  //         },
  //       },
  //     },
  //   },
  //   [ChinchonPhase.Score]: {
  //     turn: {
  //       stages: {
  //         [ChinchonStage.Score]: {
  //           moves: { scoreHandForPlayer },
  //         },
  //       },
  //     },
  //     next: ChinchonPhase.Play,
  //   },
  // },
  playerView: (G, ctx, playerID) => {
    // improve this so that players can see how many cards are in other players hands and their points
    return PlayerView.STRIP_SECRETS(G, ctx, playerID);
  },
};

export function makeDeck(): ChinchonCard[] {
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
        ordinal: i + 1, // i prefer if the ordinal matches with card value. e.g. 1 == Ace
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

function makePlayerMap(ctx: Ctx): PlayerMap {
  let players: PlayerMap = {};
  for (let p of ctx.playOrder) {
    players[p] = {
      hand: [],
      points: 0,
      didBuyIn: false,
    };
  }
  return players;
}
