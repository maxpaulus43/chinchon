import { Client } from "boardgame.io/react";
import { Local } from "boardgame.io/multiplayer";
import { Chinchon } from "./Game";
import ChinchonBoard from "./Board";
import Lobby from "./Lobby";

const showLobby = true;
const isDebug = false;

const ChinchonClient = Client({
  game: Chinchon,
  board: ChinchonBoard,
  numPlayers: 3,
  debug: isDebug,
  multiplayer: Local(),
});

const App: React.FC = () => {
  return showLobby ? (
    <Lobby />
  ) : (
    <div className="absolute w-full h-full flex gap-3 flex-wrap">
      <div className="relative w-96 h-full">
        <ChinchonClient playerID="0" />
      </div>
      <div className="relative w-96 h-full">
        <ChinchonClient playerID="1" />
      </div>
      <div className="relative w-96 h-full">
        <ChinchonClient playerID="2" />
      </div>
    </div>
  );
};

export default App;
