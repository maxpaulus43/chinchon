import { BoardProps } from "boardgame.io/react";
import React, { useEffect, useRef, useState } from "react";
import Button from "./Button";
import CardView from "./CardView";
import { canMeldWithCard } from "./MeldLogic";
import { ChinchonCard, ChinchonGameState, ChinchonStage } from "./Model";
import Sortable from "sortablejs";

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
  const myPlayer = G.playerMap[playerID];
  const myCards = myPlayer.hand;
  const canDraw = activePlayers[playerID] === ChinchonStage.Draw;
  const canDiscard = activePlayers[playerID] === ChinchonStage.Discard;
  const [selectedCard, setSelectedCard] = useState<ChinchonCard>();
  const isEliminated = !G.playOrder.includes(playerID);
  const myCardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Sortable.create(myCardsRef.current!, { animation: 200 });
  }, []);

  const emptyCard = (
    <div
      className="w-24 border-gray-400 border-2 bg-white rounded-md "
      style={{ marginRight: -117 }}
    />
  );

  return (
    <div className="absolute left-0 right-0 top-0 bottom-0 bg-green-600 flex flex-col justify-center items-center">
      <div className="flex">
        <div
          className="flex mr-5"
          onClick={() => {
            moves.drawCardFromDrawPile();
          }}
        >
          {/* {new Array(Math.min(G.drawPile.length - 1, 3))
            .fill(0)
            .map((i) => emptyCard)} */}
          <CardView showBack />
        </div>

        <div
          className="flex"
          onClick={() => {
            moves.drawCardFromDiscardPile();
          }}
        >
          {G.discardPile.length === 0 ? (
            <div className="w-24 bg-green-700 rounded-md" />
          ) : (
            <>
              {/* {new Array(Math.min(G.discardPile.length - 1, 3))
                .fill(0)
                .map((i) => emptyCard)} */}
              <CardView card={G.discardPile[G.discardPile.length - 1]} />
            </>
          )}
        </div>
      </div>
      <div>My Points: {myPlayer.points}</div>

      <div className="absolute bottom-0 flex flex-col items-center">
        <div className="flex mb-4">
          {selectedCard && canDiscard && (
            <Button
              onClick={() => {
                setSelectedCard(undefined);
                moves.discardCard(selectedCard!);
              }}
            >
              Discard
            </Button>
          )}
          {selectedCard &&
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
        <div
          ref={myCardsRef}
          className="p-2 bg-green-700 rounded-md flex justify-evenly pr-6 max-w-xl "
        >
          {myCards.map((c) => (
            <div
              draggable={true}
              className="-mr-4"
              key={c.id}
              onClick={() => {
                setSelectedCard(selectedCard?.id === c.id ? undefined : c);
              }}
            >
              <CardView card={c} highlight={selectedCard?.id === c.id} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {ctx.gameover && <div>Round OVER</div>}
      <div>My ID: {playerID}</div>
      <div>My Points: {myPlayer.points}</div>
      {isEliminated ? (
        <div>You're Eliminated</div>
      ) : (
        <div>
          <Button onClick={() => undo()}>UNDO</Button>
          <div>Draw Pile: {G.drawPile.length} cards</div>
          <div>
            Discard Pile ({G.discardPile.length} cards):
            <CardView card={G.discardPile[G.discardPile.length - 1]} />
          </div>
          <div>
            <Button
              onClick={() => moves.drawCardFromDrawPile()}
              disabled={!canDraw}
            >
              Draw From Draw Pile
            </Button>
            <Button
              onClick={() => moves.drawCardFromDiscardPile()}
              disabled={!canDraw}
            >
              Draw From Discard Pile
            </Button>
          </div>
          <div>
            {myCards.map((c) => {
              return (
                <Button
                  key={c.id}
                  onClick={() => {
                    setSelectedCard(c);
                  }}
                  disabled={!canDiscard}
                  highlight={c.id === selectedCard?.id}
                >
                  <CardView card={c} />
                </Button>
              );
            })}
          </div>
          {selectedCard && (
            <div>
              <Button
                onClick={() => {
                  setSelectedCard(undefined);
                  moves.discardCard(selectedCard!);
                }}
              >
                Discard
              </Button>
              <Button
                onClick={() => moves.meldHandWithCard(selectedCard!)}
                disabled={!canMeldWithCard(myCards, selectedCard!)}
              >
                Meld Hand
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChinchonBoard;
