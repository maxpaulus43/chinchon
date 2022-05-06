// import { Client } from "boardgame.io/react";
// import { Local } from "boardgame.io/multiplayer";
// import { Chinchon } from "./Game";
// import ChinchonBoard from "./Board";
import ChinchonLobby from "./ChinchonLobby";

// const ChinchonClient = Client({
//   game: Chinchon,
//   board: ChinchonBoard,
//   numPlayers: 3,
//   debug: false,
//   multiplayer: Local(),
// });

const App: React.FC = () => {
  return <ChinchonLobby />
  // return (
  //   <div className="absolute w-full h-full flex gap-3 flex-wrap">
  //     <div className="relative w-96 h-full">
  //       <ChinchonClient playerID="0"/>
  //     </div>
  //     <div className="relative w-96 h-full">
  //       <ChinchonClient playerID="1"/>
  //     </div>
  //     <div className="relative w-96 h-full">
  //       <ChinchonClient playerID="2"/>
  //     </div>
  //   </div>
  // );
};

export default App;
