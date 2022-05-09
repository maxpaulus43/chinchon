import type { Ctx, PlayerID } from "boardgame.io";

export enum ChinchonStage {
  Draw = "draw",
  Discard = "discard",
  ReviewRound = "reviewround",
}

export enum ChinchonPhase {
  Play = "play",
  Review = "review",
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
  handLength: number
  points: number;
  didBuyIn: boolean;
}

export interface PlayerMap {
  [playerID: string]: ChinchonPlayerState;
}

export interface RoundEndState {
  [playerID: string]: {
    points: number,
    hand: ChinchonCard[]
  };
}

export interface ChinchonGameState {
  drawPile: ChinchonCard[];
  drawPileLen: number;
  discardPile: ChinchonCard[];
  discardPileLen: number;
  players: PlayerMap;
  playOrder: Array<PlayerID>;
  playOrderPos: number;
  roundEndState: RoundEndState
}

export interface GameEndState {
  winner: string
}

export interface ChinchonCtx extends Ctx {}
