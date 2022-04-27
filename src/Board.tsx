import { BoardProps } from "boardgame.io/react";
import React from "react";
import { ChinchonGameState } from "./Game";

interface ChinchonBoardProps extends BoardProps<ChinchonGameState> {}

const ChinchonBoard: React.FC<ChinchonBoardProps> = ({
  G,
  moves,
  playerID,
}) => {
  const draw = () => {
    moves.drawCardFromDrawPile();
  };
  const discard = (theCard: string) => {
    moves.discardCard(theCard);
  };

  const myCards = G.players[playerID ?? ""]?.hand;

  return (
    <div>
      <div>Draw Pile: {G.drawPile.length} cards</div>
      <div>Discard Pile: {G.discardPile.length} cards</div>
      <div>Game: {JSON.stringify(G)}</div>
      <div>
        <button onClick={draw}>Draw</button>
      </div>
      <div>
        {myCards.map((c) => {
          return <button key={c} onClick={() => discard(c)}>{c}</button>;
        })}
      </div>
    </div>
  );
};

export default ChinchonBoard;
