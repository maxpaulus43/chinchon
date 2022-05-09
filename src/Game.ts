import { Game, Ctx, Move, PlayerID, StageArg } from "boardgame.io";
import { INVALID_MOVE } from "boardgame.io/core";
import {
  calculatePointsForHand,
  canMeldWithCard,
  cardCompareFn,
  removeJokersFromCards,
} from "./MeldLogic";
import {
  CardSuit,
  ChinchonCard,
  ChinchonCtx,
  ChinchonGameState,
  ChinchonPhase,
  ChinchonStage,
  PlayerMap,
} from "./Model";

const drawCardFromDrawPile: Move<ChinchonGameState> = (G, ctx) => {
  const theCard = G.drawPile.pop();
  if (!theCard) {
    return INVALID_MOVE;
  }

  if (G.drawPile.length == 0) {
    const newDrawPile = G.discardPile.splice(0, G.discardPile.length - 1);
    ctx.random!.Shuffle(newDrawPile);
    G.drawPile = newDrawPile;
  }

  G.discardPileLen = G.discardPile.length;
  G.drawPileLen = G.drawPile.length;
  const p = G.players[ctx.currentPlayer];
  p.hand.push(theCard);
  p.handLength = p.hand.length;
  ctx.events?.endStage();
};

const drawCardFromDiscardPile: Move<ChinchonGameState> = (G, ctx) => {
  const theCard = G.discardPile.pop();
  if (!theCard) {
    return INVALID_MOVE;
  }

  const p = G.players[ctx.currentPlayer];
  p.hand.push(theCard);
  p.handLength = p.hand.length;
  G.discardPileLen = G.discardPile.length;
  ctx.events?.endStage();
};

const discardCard: Move<ChinchonGameState> = (
  G,
  ctx,
  theCard: ChinchonCard
) => {
  const p = G.players[ctx.currentPlayer];
  const hand = p.hand;
  const idx = hand.findIndex((c) => c.id === theCard.id);
  if (idx < 0) {
    return INVALID_MOVE;
  }
  const discardedCard = hand.splice(idx, 1)[0];
  p.handLength = hand.length;
  G.discardPile.push(discardedCard);
  G.discardPileLen = G.discardPile.length;
  ctx.events?.endTurn();
};

const meldHandWithCard: Move<ChinchonGameState> = (
  G,
  ctx,
  meldCard: ChinchonCard
) => {
  const hand = G.players[ctx.currentPlayer].hand;
  const meldCardIdx = hand.findIndex((c) => c.id === meldCard.id);
  if (meldCardIdx < 0 || !canMeldWithCard(hand, meldCard)) {
    return INVALID_MOVE;
  }
  hand.splice(meldCardIdx, 1);
  scoreAndEliminatePlayers(G, ctx, hand);
  ctx.events?.endPhase();
};

const endReview: Move<ChinchonGameState> = (G, ctx) => {
  if (!ctx.activePlayers || Object.keys(ctx.activePlayers).length === 1) {
    resetGame(G, ctx);
    ctx.events?.endPhase();
  }
};

function scoreAndEliminatePlayers(
  G: ChinchonGameState,
  ctx: ChinchonCtx,
  winningHand: ChinchonCard[]
) {
  for (const [pId, player] of Object.entries(G.players)) {
    const [points, optimalHand] = calculatePointsForHand(G, player.hand);
    G.roundEndState[pId] = {
      points,
      hand: optimalHand,
    };

    player.points += points;
    // TODO support buyback logic
    if (player.points >= 100) {
      const idx = G.playOrder.indexOf(pId);
      G.playOrder.splice(idx, 1);
      if (idx < G.playOrderPos) {
        G.playOrderPos--;
      }
    }
  }
}

function resetGame(G: ChinchonGameState, ctx: ChinchonCtx) {
  const deck = makeDeck();
  if (ctx.numPlayers <= 2) {
    removeJokersFromCards(deck);
  }
  G.drawPile = ctx.random!.Shuffle(deck);
  for (let player of Object.values(G.players)) {
    player.hand.splice(0, player.hand.length, ...G.drawPile.splice(0, 7));
    player.hand.sort(cardCompareFn);
  }
  G.discardPile = [G.drawPile.pop()!];
  G.drawPileLen = G.drawPile.length;
  G.discardPileLen = G.discardPile.length;
}

export const Chinchon: Game<ChinchonGameState, ChinchonCtx> = {
  name: "Chinchon",
  maxPlayers: 4,
  setup: (ctx) => {
    const deck = makeDeck();
    if (ctx.numPlayers <= 2) {
      removeJokersFromCards(deck);
    }
    const drawPile = ctx.random!.Shuffle(deck);
    const playerMap = makePlayers(ctx);
    for (let player of Object.values(playerMap)) {
      player.hand.push(...drawPile.splice(0, 7));
      player.hand.sort(cardCompareFn);
      player.handLength = player.hand.length;
    }
    const discardPile = [drawPile.pop()!];
    return {
      drawPile,
      drawPileLen: drawPile.length,
      discardPile,
      discardPileLen: discardPile.length,
      players: playerMap,
      roundEndState: {},
      playOrder: ctx.playOrder,
      playOrderPos: ctx.playOrderPos,
      currentPlayer: ctx.currentPlayer,
    };
  },
  endIf: (G) => {
    if (G.playOrder.length === 1) {
      return { winner: G.playOrder[0] };
    }
  },
  phases: {
    [ChinchonPhase.Play]: {
      start: true,
      turn: {
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
      next: ChinchonPhase.Review,
    },
    [ChinchonPhase.Review]: {
      turn: {
        onBegin: (G, ctx) => {
          const activePlayersValue: Record<PlayerID, StageArg> = {};
          for (const pId of G.playOrder) {
            activePlayersValue[pId] = { stage: ChinchonStage.ReviewRound };
          }

          ctx.events?.setActivePlayers({
            value: activePlayersValue,
            minMoves: 1,
            maxMoves: 1,
          });
        },
        stages: {
          [ChinchonStage.ReviewRound]: {
            moves: { endReview },
          },
        },
      },
      next: ChinchonPhase.Play,
    },
  },
  playerView: (G, ctx, playerID) => {
    // TODO if player is eliminated, show them the entire game state (basically, allow them to spectate)
    if (!playerID || !G.playOrder.includes(playerID)) {
      return G;
    }

    const GG = { ...G };

    GG.drawPile = [];
    GG.discardPile = GG.discardPile.slice(GG.discardPile.length - 1);
    GG.players = JSON.parse(JSON.stringify(G.players));

    for (const [pID, p] of Object.entries(GG.players)) {
      if (pID !== playerID) {
        p.handLength = p.hand.length;
        p.hand = [];
      }
    }
    return GG;
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

function makePlayers(ctx: Ctx): PlayerMap {
  let players: PlayerMap = {};
  for (let p of ctx.playOrder) {
    players[p] = {
      hand: [],
      handLength: 0,
      points: 0,
      didBuyIn: false,
    };
  }
  return players;
}
