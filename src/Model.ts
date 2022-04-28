import { Ctx } from "boardgame.io";

export enum ChinchonStage {
  Draw = "draw",
  Discard = "discard",
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

export interface Players {
  [playerID: string]: ChinchonPlayerState;
}

export interface ChinchonGameState {
  drawPile: ChinchonCard[];
  discardPile: ChinchonCard[];
  players: Players;
}

export type ChinchonCtx = Ctx;
