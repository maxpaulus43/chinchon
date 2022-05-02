import type { Ctx, PlayerID } from "boardgame.io";

export enum ChinchonStage {
  Draw = "draw",
  Discard = "discard",
  Score = "score",
}

export enum ChinchonPhase {
  Play = "play",
  Score = "score",
}

export enum CardSuit {
  Heart = "♥️",
  Diamond = "♦️",
  Club = "♣️",
  Spade = "♠️",
}

export interface ChinchonCard {
  id: string;
  ordinal: number;
  pointValue: number;
  suit: CardSuit;
  symbol: string;
}

export interface ChinchonPlayerState {
  hand: ChinchonCard[];
  points: number;
  didBuyIn: boolean;
}

export interface PlayerMap {
  [playerID: string]: ChinchonPlayerState;
}

export interface ChinchonGameState {
  drawPile: ChinchonCard[];
  discardPile: ChinchonCard[];
  playerMap: PlayerMap;
  playOrder: Array<PlayerID>;
  playOrderPos: number;
  currentPlayer: PlayerID;
}

export interface ChinchonCtx extends Ctx {}
