import React from "react";
import Button from "./Button";
import CardView from "./CardView";
import { ChinchonCtx, ChinchonGameState } from "./Model";

interface EndRoundInfoProps {
  G: ChinchonGameState;
  ctx: ChinchonCtx;
  onClose: () => void;
}

const EndRoundInfo: React.FC<EndRoundInfoProps> = ({ G, ctx, onClose }) => {
  return (
    <div className="absolute bg-green-900 p-5 m-5 rounded-md z-20 flex flex-col gap-5 justify-between">
      <div>Round End Review</div>
      {G.roundEndState && (
        <div>
          {Object.entries(G.roundEndState).map(([pID, { points, hand }]) => {
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
          })}
        </div>
      )}
      <Button
        onClick={() => {
          onClose();
        }}
      >
        Start Next Round
      </Button>
    </div>
  );
};

export default EndRoundInfo;
