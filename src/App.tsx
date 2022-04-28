import { Client } from "boardgame.io/react";
import { Local } from "boardgame.io/multiplayer";
import { Chinchon } from "./Game";
import ChinchonBoard from "./Board";

const ChinchonClient = Client({
  game: Chinchon,
  board: ChinchonBoard,
  numPlayers: 2,
  multiplayer: Local(),
});

const App: React.FC = () => {
  return (
    <div>
      <ChinchonClient playerID="0" />
      <br />
      <ChinchonClient playerID="1" />
    </div>
  );
};

export default App;
