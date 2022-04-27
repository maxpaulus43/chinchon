import { Game, Ctx } from "boardgame.io";
import { INVALID_MOVE, PlayerView } from "boardgame.io/core";


export interface ChinchonPlayerState {
  hand: string[];
  points: number;
  didBuyIn: boolean;
}

export interface ChinchonGameState {
  drawPile: string[];
  discardPile: string[];
  players: { [playerID: string]: ChinchonPlayerState };
}

export type ChinchonCtx = Ctx;

export const Chinchon: Game<ChinchonGameState, ChinchonCtx> = {
  setup: (ctx) => {
    return {
      drawPile: makeDeck(ctx),
      discardPile: [],
      players: (() => {
        let players: { [playerID: string]: ChinchonPlayerState } = {};
        for (let p of ctx.playOrder) {
          players[p] = {
            hand: [],
            points: 0,
            didBuyIn: false,
          };
        }
        return players;
      })(),
    };
  },
  turn: {
    moveLimit: 1,
  },
  moves: {
    drawCardFromDrawPile: (G, ctx) => {
      const theCard = G.drawPile.pop();
      if (!theCard) {
        return INVALID_MOVE;
      }
      G.players[ctx.playOrderPos].hand.push(theCard);
    },
    drawCardFromDiscardPile: (G, ctx) => {
      const theCard = G.discardPile.pop();
      if (!theCard) {
        return INVALID_MOVE;
      }
      G.players[ctx.playOrderPos].hand.push(theCard);
    },
    discardCard: (G, ctx, theCard: string) => {
      let hand = G.players[ctx.playOrderPos].hand;
      const idx = hand.findIndex((s) => s === theCard);
      if (idx < 0) {
        return INVALID_MOVE;
      }
      G.discardPile.push(hand.splice(idx, 1)[0]);
    },
  },
  playerView: (G, ctx, playerID) => {
    return PlayerView.STRIP_SECRETS(G, ctx, playerID)
  }
};

function makeDeck(ctx: Ctx): string[] {
  const pips = "A,2,3,4,5,6,7,8,9,10,J,Q,K".split(",");
  const suits = "H,D,C,S".split(",");
  const cards: string[] = [];
  for (const pip of pips) {
    for (const suit of suits) {
      cards.push(pip + suit);
    }
  }
  cards.push("JR", "JB");
  return ctx.random!.Shuffle(cards);
}
