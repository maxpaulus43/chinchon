import { BoardProps } from "boardgame.io/react";
import React, { useEffect, useRef, useState } from "react";
import Button from "./Button";
import CardView from "./CardView";
import { canMeldWithCard } from "./MeldLogic";
import {
  ChinchonCard,
  ChinchonGameState,
  ChinchonPlayerState,
  ChinchonStage,
  GameEndState,
} from "./Model";
import Sortable from "sortablejs";
import OpponentHand from "./OpponentHand";
import { isAndroid } from "./utils";

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
    const delay = isAndroid() ? 100 : 0;
    if (myCardsRef.current) {
      Sortable.create(myCardsRef.current, {
        animation: 100,
        ghostClass: "opacity-0",
        delay,
      });
    }
  }, []);

  return (
    <div className="absolute top-0 right-0 bottom-0 left-0 bg-green-600 flex flex-col justify-between items-center p-4">
      {winner && (
        <div className="absolute top-1/3 bg-white p-5 rounded-md text-center">
          <div>{winner === playerID ? "You Won!" : "You Lost"}</div>
          <div>Winner: Player {winner}</div>
          <Button
            onClick={() => {
              window.location.reload();
            }}
          >
            Refresh Page
          </Button>
        </div>
      )}

      {shouldReview && (
        <div className="absolute bg-white p-5 m-5 rounded-md z-10 flex flex-col gap-5 justify-between">
          <div>Round End Review</div>
          {G.roundEndState && (
            <div>
              {Object.entries(G.roundEndState).map(
                ([pID, { points, hand }]) => {
                  return (
                    <div>
                      <span>
                        Player {pID} (+{points} points):
                      </span>
                      <span className="flex gap-1">
                        {hand.map((c) => (
                          <span className="w-9 hover:scale-[2] transition">
                            <CardView card={c} />
                          </span>
                        ))}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          )}
          <Button
            onClick={() => {
              moves.endReview();
            }}
          >
            Next Round (waiting on {Object.keys(ctx.activePlayers ?? {}).length}{" "}
            more players)
          </Button>
        </div>
      )}

      <div className="flex justify-evenly">
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
        <div>
          My Points: {myPlayer.points}{" "}
          {isEliminated && (
            <span className="text-red-700 font-bold bg-white p-[0.1rem] rounded-sm">
              ELIMINATED
            </span>
          )}
        </div>
        <div
          ref={myCardsRef}
          className={`p-2 ${
            isMyTurn ? "bg-yellow-400" : "bg-green-700"
          } rounded-md flex justify-evenly pr-6 max-w-xl`}
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
                        setSelectedCard(undefined);
                        moves.discardCard(selectedCard!);
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
