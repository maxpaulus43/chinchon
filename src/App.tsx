import { Client } from "boardgame.io/react";
import { Local } from "boardgame.io/multiplayer";
import { Chinchon } from "./Game";
import ChinchonBoard from "./Board";
import Lobby from "./Lobby";

const hideLobby = process.env.REACT_APP_HIDE_LOBBY;
const isDebug = true;

const ChinchonClient = Client({
  game: Chinchon,
  board: ChinchonBoard,
  numPlayers: 4,
  debug: isDebug,
  multiplayer: Local(),
});

const App: React.FC = () => {
  return hideLobby ? (
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
      <div className="relative w-96 h-full">
        <ChinchonClient playerID="3" />
      </div>
    </div>
  ) : (
    <Lobby />
  );
};

export default App;
