import { BoardProps } from "boardgame.io/react";
import React, { useState } from "react";
import Button from "./Button";
import CardView from "./CardView";
import { canMeldWithCard } from "./MeldLogic";
import { ChinchonCard, ChinchonGameState, ChinchonStage } from "./Model";

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
                  moves.discardCard(selectedCard);
                }}
              >
                Discard
              </Button>
              <Button
                onClick={() => moves.meldHandWithCard(selectedCard)}
                disabled={!canMeldWithCard(myCards, selectedCard)}
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
