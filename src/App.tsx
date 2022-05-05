import { Client } from "boardgame.io/react";
import { Local } from "boardgame.io/multiplayer";
import { Chinchon } from "./Game";
import ChinchonBoard from "./Board";
import ChinchonLobby from "./ChinchonLobby";

const ChinchonClient = Client({
  game: Chinchon,
  board: ChinchonBoard,
  numPlayers: 1,
  debug: false,
  multiplayer: Local(),
});

const App: React.FC = () => {
  // return <ChinchonLobby />
  return (
    <div>
      <ChinchonClient playerID="0" />
    </div>
  );
};

export default App;
