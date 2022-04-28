import { BoardProps } from "boardgame.io/react";
import React, { useState } from "react";
import Button from "./Button";
import { canMeldWithCard, getMeldablePermutationsForHand } from "./MeldLogic";
import { ChinchonCard, ChinchonGameState, ChinchonStage } from "./Model";

interface ChinchonBoardProps extends BoardProps<ChinchonGameState> {}

const ChinchonBoard: React.FC<ChinchonBoardProps> = ({
  G,
  ctx,
  moves,
  playerID,
  undo,
}) => {
  const myCards = G.players[playerID!]?.hand;
  const canDraw = ctx.activePlayers![playerID!] === ChinchonStage.Draw;
  const canDiscard = ctx.activePlayers![playerID!] === ChinchonStage.Discard;
  const [selectedCard, setSelectedCard] = useState<ChinchonCard>();

  return (
    <div>
      {ctx.gameover && <div>GAME OVER</div>}
      <div>My ID: {playerID}</div>
      <Button onClick={undo}>UNDO</Button>
      <div>Draw Pile: {G.drawPile.length} cards</div>
      <div>Discard Pile: {G.discardPile.length} cards</div>
      <div>
        <Button onClick={moves.drawCardFromDrawPile} disabled={!canDraw}>
          Draw From Draw Pile
        </Button>
        <Button onClick={moves.drawCardFromDiscardPile} disabled={!canDraw}>
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
              {c.id}
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
  );
};

export default ChinchonBoard;
