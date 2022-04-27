import "./App.css";
import { Client } from "boardgame.io/react";
import { Local } from "boardgame.io/multiplayer";
import { Chinchon } from "./Game";
import ChinchonBoard from "./Board";

const ChinchonClient = Client({
  game: Chinchon,
  board: ChinchonBoard,
  multiplayer: Local(),
});

const App: React.FC = () => {
  return (
    <div>
      <ChinchonClient playerID="0" />
      <ChinchonClient playerID="1" />
    </div>
  );
};

export default App;
