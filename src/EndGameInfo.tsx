import React from "react";
import Button from "./Button";
import EndRoundInfo from "./EndRoundInfo";
import { ChinchonGameState } from "./Model";

interface WinnerModalProps {
  G: ChinchonGameState;
  didIWin: boolean;
  winner: string;
}

const WinnerModal: React.FC<WinnerModalProps> = ({ G, didIWin, winner }) => {
  return (
    <EndRoundInfo
      title={didIWin ? "You Won the Game!" : `You Lost the Game (Player ${winner} won)`}
      G={G}
      callToAction={() => (
        <Button
          onClick={() => {
            window.location.reload();
          }}
        >
          Refresh Page
        </Button>
      )}
    />
  );
};

export default WinnerModal;
