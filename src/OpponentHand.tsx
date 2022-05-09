import React from "react";
import CardView from "./CardView";
import { ChinchonPlayerState } from "./Model";

interface OpponentHandProps {
  playerID: string;
  player: ChinchonPlayerState;
  highlight?: boolean;
}

const OpponentHand: React.FC<OpponentHandProps> = ({
  playerID,
  player,
  highlight,
}) => {
  return (
    <div>
      <div className="text-center">Player {playerID}</div>
      <div
        className={`flex p-1 pr-5 rounded-md ${
          highlight ? "bg-yellow-400" : ""
        }`}
      >
        {new Array(player.handLength).fill(0).map((n, i) => {
          return (
            <div className=" bg-white shadow-lg -mr-4 rounded-sm" key={i}>
              <CardView showBack />
            </div>
          );
        })}
      </div>
      <div className="text-center">Points: {player.points}</div>
    </div>
  );
};

export default OpponentHand;
