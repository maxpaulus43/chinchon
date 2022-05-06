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
  undo,
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

  useEffect(() => {
    const delay = isAndroid() ? 100 : 0;
    Sortable.create(myCardsRef.current!, {
      animation: 100,
      ghostClass: "opacity-0",
      delay,
    });
  }, []);

  return (
    <div className="absolute w-full h-full bg-green-600 flex flex-col justify-between items-center p-4">
      <div className="flex justify-evenly">
        {G.playOrder
          .filter((pID) => pID !== playerID)
          .map((pID) => [pID, G.players[pID]] as [string, ChinchonPlayerState])
          .map(([pID, p]) => {
            return (
              <div className="max-w-sm">
                <OpponentHand
                  key={pID}
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
          {!isEliminated && <span className="text-red-500">ELIMINATED</span>}
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
