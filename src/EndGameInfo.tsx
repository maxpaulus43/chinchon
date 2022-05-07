import React from "react";
import Button from "./Button";

interface WinnerModalProps {
    didIWin: boolean;
    winner: string;
}

const WinnerModal: React.FC<WinnerModalProps> = ({didIWin, winner}) => {
  return (
    <div className="absolute top-1/3 bg-green-900 p-5 rounded-md text-center">
      <div>{didIWin ? "You Won!" : "You Lost"}</div>
      <div>Winner: Player {winner}</div>
      <Button
        onClick={() => {
          window.location.reload();
        }}
      >
        Refresh Page
      </Button>
    </div>
  );
};

export default WinnerModal;
