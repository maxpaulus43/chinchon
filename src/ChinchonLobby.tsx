import React from "react";
import { Lobby } from "boardgame.io/react";
import { Chinchon } from "./Game";
import ChinchonBoard from "./Board";

interface ChinchonLobbyProps {}

const ChinchonLobby: React.FC<ChinchonLobbyProps> = () => {
  return (
    <Lobby
      gameServer={`http://${window.location.hostname}:8081`}
      lobbyServer={`http://${window.location.hostname}:8081`}
      gameComponents={[{ game: Chinchon, board: ChinchonBoard }]}
    />
  );
};

export default ChinchonLobby;
