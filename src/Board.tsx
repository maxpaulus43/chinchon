import { BoardProps } from "boardgame.io/react";
import React, { useEffect, useRef, useState } from "react";
import Button from "./Button";
import CardView from "./CardView";
import { canMeldWithCard } from "./MeldLogic";
import {
  ChinchonCard,
  ChinchonGameState,
  ChinchonPhase,
  ChinchonPlayerState,
  ChinchonStage,
  GameEndState,
} from "./Model";
import Sortable from "sortablejs";
import OpponentHand from "./OpponentHand";
import { isAndroid } from "./utils";
import EndGameInfo from "./EndGameInfo";
import EndRoundInfo from "./EndRoundInfo";

interface ChinchonBoardProps extends BoardProps<ChinchonGameState> {}

const ChinchonBoard: React.FC<ChinchonBoardProps> = ({
  G,
  ctx,
  moves,
  playerID,
  undo, // TODO
}) => {
  playerID = playerID!;
  const activePlayers = ctx.activePlayers ?? {};
  const isMyTurn = ctx.currentPlayer === playerID;
  const myPlayer = G.players[playerID];
  const myCards = myPlayer.hand;
  const canDiscard = activePlayers[playerID] === ChinchonStage.Discard;
  const [selectedCard, setSelectedCard] = useState<ChinchonCard>();
  const isEliminated = !G.playOrder.includes(playerID);
  const myCardsRef = useRef<HTMLDivElement>(null);
  const shouldReview = activePlayers[playerID] === ChinchonStage.ReviewRound;
  const isGameOver = ctx.gameover as GameEndState;
  const winner = isGameOver && isGameOver.winner;

  useEffect(() => {
    if (myCardsRef.current) {
      Sortable.create(myCardsRef.current, {
        animation: 100,
        ghostClass: "opacity-0",
        delay: isAndroid() ? 100 : 0,
      });
    }
  }, []);

  let roundEndString = undefined;
  if (ctx.phase === ChinchonPhase.Review) {
    roundEndString = "Waiting on";
    const activePlayerIDs = Object.keys(ctx.activePlayers ?? {});
    if (activePlayerIDs.includes(playerID)) {
      roundEndString += " You";
      if (activePlayerIDs.length > 1) {
        const plural = activePlayerIDs.length - 1 > 0 ? "s" : "";
        roundEndString += ` and ${
          activePlayerIDs.length - 1
        } other player${plural}`;
      }
    } else if (activePlayerIDs.length > 0) {
      const plural = activePlayerIDs.length > 1 ? "s" : "";
      roundEndString += ` ${activePlayerIDs.length} other player${plural}`;
    }
    roundEndString += " to end the round";
  }

  return (
    <div className="absolute top-0 right-0 bottom-0 left-0 bg-green-600 flex flex-col justify-between items-center p-4">
      {winner && <EndGameInfo didIWin={winner === playerID} winner={winner} />}

      {shouldReview && (
        <EndRoundInfo G={G} ctx={ctx} onClose={() => moves.endReview()} />
      )}

      {roundEndString && (
        <div className="bg-green-900 p-5 m-5 rounded-md z-10">
          {roundEndString}
        </div>
      )}

      <div id="opponentCards" className="flex justify-evenly">
        {G.playOrder
          .filter((pID) => pID !== playerID)
          .map((pID) => [pID, G.players[pID]] as [string, ChinchonPlayerState])
          .map(([pID, p]) => {
            return (
              <div key={pID} className="max-w-sm">
                <OpponentHand
                  playerID={pID}
                  player={p}
                  highlight={ctx.currentPlayer === pID}
                />
              </div>
            );
          })}
      </div>

      <div id="piles" className="flex justify-center">
        <div
          id="drawPile"
          className="flex mr-5"
          onClick={() => {
            moves.drawCardFromDrawPile();
          }}
        >
          <div className="w-32">
            <CardView showBack />
          </div>
        </div>

        <div
          id="discardPile"
          className="flex "
          onClick={() => {
            moves.drawCardFromDiscardPile();
          }}
        >
          {G.discardPile.length === 0 ? (
            <div className="bg-green-700 rounded-md w-32" />
          ) : (
            <div className="w-32">
              <CardView card={G.discardPile[G.discardPile.length - 1]} />
            </div>
          )}
        </div>
      </div>

      <div id="myCards" className="flex flex-col items-center">
        {isEliminated && (
          <div className="text-red-700 font-bold bg-white p-[0.1rem] rounded-sm">
            ELIMINATED
          </div>
        )}
        <div>My Points: {myPlayer.points}</div>
        <div
          ref={myCardsRef}
          className={`p-2 rounded-md flex justify-evenly pr-6 max-w-xl ${
            isMyTurn ? "bg-yellow-400" : "bg-green-700"
          } `}
        >
          {myCards.map((c) => (
            <div
              className="-mr-4"
              key={c.id}
              onClick={() => {
                if (canDiscard) {
                  setSelectedCard(selectedCard?.id === c.id ? undefined : c);
                }
              }}
            >
              <div
                className={`relative flex flex-col items-center transition ${
                  selectedCard?.id === c.id ? "-translate-y-4" : ""
                }`}
              >
                <div className="flex flex-col absolute -translate-y-full">
                  {selectedCard?.id === c.id && canDiscard && (
                    <Button
                      onClick={() => {
                        moves.discardCard(selectedCard!);
                        setSelectedCard(undefined);
                      }}
                    >
                      Discard
                    </Button>
                  )}
                  {selectedCard?.id === c.id &&
                    canDiscard &&
                    canMeldWithCard(myCards, selectedCard) && (
                      <Button
                        onClick={() => {
                          setSelectedCard(undefined);
                          moves.meldHandWithCard(selectedCard!);
                        }}
                      >
                        Meld
                      </Button>
                    )}
                </div>
                <CardView card={c} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChinchonBoard;
