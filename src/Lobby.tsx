import React, { ComponentType, useState } from "react";
import { Client, Lobby } from "boardgame.io/react";
import { Chinchon } from "./Game";
import ChinchonBoard from "./Board";
import Button from "./Button";
import { Game, LobbyAPI, Server } from "boardgame.io";
import useCardImage from "./hooks/useImage";

enum LobbyPhases {
  ENTER = "enter",
  PLAY = "play",
  LIST = "list",
}

interface MatchOpts {
  numPlayers: number;
  matchID: string;
  playerID?: string;
}

interface RunningMatch {
  app: ReturnType<typeof Client>;
  matchID: string;
  playerID: string;
  credentials?: string;
}

interface GameComponent {
  game: Game;
  board: ComponentType<any>;
}

interface ChinchonLobbyProps {}

interface LobbyRendererProps {
  errorMsg: string;
  gameComponents: GameComponent[];
  matches: LobbyAPI.MatchList["matches"];
  phase: LobbyPhases;
  playerName: string;
  runningMatch?: RunningMatch;
  handleEnterLobby: (playerName: string) => void;
  handleExitLobby: () => Promise<void>;
  handleCreateMatch: (gameName: string, numPlayers: number) => Promise<void>;
  handleJoinMatch: (
    gameName: string,
    matchID: string,
    playerID: string
  ) => Promise<void>;
  handleLeaveMatch: (gameName: string, matchID: string) => Promise<void>;
  handleExitMatch: () => void;
  handleRefreshMatches: () => Promise<void>;
  handleStartMatch: (gameName: string, matchOpts: MatchOpts) => void;
}

const port = process.env.REACT_APP_PORT;

const ChinchonLobby: React.FC<ChinchonLobbyProps> = () => {
  let serverAddr = `${window.location.protocol}//${window.location.hostname}`;
  if (port) {
    serverAddr += ":" + port;
  }
  return (
    <Lobby
      gameServer={serverAddr}
      lobbyServer={serverAddr}
      gameComponents={[{ game: Chinchon, board: ChinchonBoard }]}
      renderer={(L) => {
        return (
          <div className="absolute w-full h-full bg-green-600">
            {L.phase === LobbyPhases.ENTER && <EnterLobbyView L={L} />}
            {L.phase === LobbyPhases.LIST && <ListGamesView L={L} />}
            {L.phase === LobbyPhases.PLAY && <RunningMatchView L={L} />}

            {/* {L.errorMsg && (
              <div className="absolute bottom-5 left-0 right-0 flex justify-center">
                <div className=" text-center rounded-md bg-red-700 w-2/3 max-w-sm shadow-2xl p-4">
                  ⚠️{L.errorMsg}
                </div>
              </div>
            )} */}
          </div>
        );
      }}
    />
  );
};

export type Match = Omit<Server.MatchData, "players"> & {
  matchID: string;
  players: Omit<Server.PlayerMetadata, "credentials">[];
};

const EnterLobbyView: React.FC<{ L: LobbyRendererProps }> = ({ L }) => {
  const [playerName, setPlayerName] = useState(L.playerName);
  const { image } = useCardImage("gh");
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <div>Choose a name:</div>

      <div>
        <input
          className="border-2 border-blue-300 rounded-md p-1"
          type="text"
          value={playerName}
          onChange={(e) => {
            setPlayerName(e.target.value);
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter" && playerName !== "") {
              L.handleEnterLobby(playerName);
            }
          }}
        />
        <Button
          onClick={() => {
            if (playerName !== "") {
              L.handleEnterLobby(playerName);
            }
          }}
        >
          Enter
        </Button>
      </div>
      <div>
        <a
          href="https://github.com/maxpaulus43/chinchon/blob/main/README.md"
          className="flex items-center gap-3 underline"
        >
          How to play chinchon <img src={image} className="w-8" alt="gh" />
        </a>
      </div>
      <div></div>
    </div>
  );
};

const ListGamesView: React.FC<{ L: LobbyRendererProps }> = ({ L }) => {
  const [numPlayers, setNumPlayers] = useState(2);
  const matches = []
  const seen = new Set<string>()
  for (const m of L.matches) {
    if (!seen.has(m.matchID)) {
      matches.push(m)
      seen.add(m.matchID)
    }
  }

  return (
    <div className="p-2">
      <Button
        onClick={() => {
          L.handleExitLobby();
        }}
      >
        Leave Lobby
      </Button>
      <div className="w-full flex justify-center">
        <div className="flex-grow max-w-lg">
          <div className="text-center">Hi {L.playerName}!</div>
          <div className="flex justify-evenly gap-1 items-center">
            <label htmlFor="playerCount">Players:</label>
            <select
              className="flex-grow"
              name="playerCount"
              id="playerCountSelect"
              defaultValue={"2"}
              onChange={({ target: { value } }) => {
                setNumPlayers(parseInt(value));
              }}
            >
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
            <Button
              onClick={() => {
                L.handleCreateMatch(L.gameComponents[0].game.name!, numPlayers);
              }}
            >
              Create Match
            </Button>
          </div>

          <div className="text-lg">Join a Match</div>
          {matches.map((m) => (
            <div
              className="flex gap-3 justify-between items-center border-b-2 border-black"
              key={m.matchID}
            >
              <div>{m.gameName}</div>
              <div>{m.players.map((p) => p.name ?? "[free]").join(", ")}</div>
              {createMatchButtons(L, m, numPlayers)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const RunningMatchView: React.FC<{ L: LobbyRendererProps }> = ({ L }) => {
  return (
    <div>
      {L.runningMatch && (
        <L.runningMatch.app
          matchID={L.runningMatch.matchID}
          playerID={L.runningMatch.playerID}
          credentials={L.runningMatch.credentials}
        />
      )}
      <div className="absolute">
        <Button
          onClick={() => {
            L.handleExitMatch();
          }}
        >
          Exit
        </Button>
      </div>
    </div>
  );
};

function createMatchButtons(
  L: LobbyRendererProps,
  m: LobbyAPI.Match,
  numPlayers: number
): JSX.Element {
  const playerSeat = m.players.find((p) => p.name === L.playerName);
  const freeSeat = m.players.find((p) => !p.name);
  if (playerSeat && freeSeat) {
    // already seated: waiting for match to start
    return (
      <Button
        onClick={() => {
          L.handleLeaveMatch(m.gameName, m.matchID);
        }}
      >
        Leave
      </Button>
    );
  }
  if (freeSeat) {
    // at least 1 seat is available
    return (
      <Button
        onClick={() => {
          L.handleJoinMatch(m.gameName, m.matchID, "" + freeSeat.id);
        }}
      >
        Join
      </Button>
    );
  }
  // match is full
  if (playerSeat) {
    return (
      <>
        <Button
          onClick={() => {
            L.handleStartMatch(m.gameName, {
              numPlayers,
              playerID: "" + playerSeat.id,
              matchID: m.matchID,
            });
          }}
        >
          Play
        </Button>
        <Button
          onClick={() => {
            L.handleLeaveMatch(m.gameName, m.matchID);
          }}
        >
          Leave
        </Button>
      </>
    );
  }
  // TODO add spectate button
  return <div>Match In Progress...</div>;
}

export default ChinchonLobby;
