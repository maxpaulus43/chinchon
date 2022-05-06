import React from "react";
import { Lobby } from "boardgame.io/react";
import { Chinchon } from "./Game";
import ChinchonBoard from "./Board";

interface ChinchonLobbyProps {}

const ChinchonLobby: React.FC<ChinchonLobbyProps> = () => {
  return (
    <Lobby
      gameServer={`${window.location.protocol}//${window.location.hostname}`}
      lobbyServer={`${window.location.protocol}//${window.location.hostname}`}
      gameComponents={[{ game: Chinchon, board: ChinchonBoard }]}
    />
  );
};

export default ChinchonLobby;
