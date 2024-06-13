import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../socket";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

interface Move {
  from: string;
  to: string;
}

interface Message {
  type: string;
  move?: Move;
}

export function Room() {
  const [game, setGame] = useState<Chess>(new Chess());
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const { roomId } = useParams<{ roomId: string }>();

  useEffect(() => {
    socket.emit("join room", roomId);

    socket.on("message", (data: Message) => {
      if (data.type === "move" && data.move) {
        const { from, to } = data.move;
        makeAMove(from, to);
      }
    });

    socket.on("error", (error: any) => {
      console.error("Error from server:", error.message);
    });

    return () => {
      socket.emit("leave room", roomId);
      socket.off("message"); // Clean up socket event listener
      socket.off("error"); // Clean up socket event listener
    };
  }, [roomId]);

  const makeAMove = (from: string, to: string) => {
    const gameCopy = new Chess(game.fen()); // Create a copy of the current game state
    const move = gameCopy.move({ from, to });
    if (move === null) {
      console.log("Invalid move:", { from, to });
    } else {
      setGame(gameCopy); // Update the state with the new game state
    }
  };

  const handleMoveSubmit = () => {
    const move = game.move({ from, to });
    if (move !== null) {
      socket.emit("message", {
        type: "move",
        room: roomId,
        move: { from, to },
      });
      setFrom(""); // Clear the input fields after move
      setTo("");
    } else {
      console.log("Invalid move attempt:", { from, to });
    }
  };

  return (
    <div>
      <h1>Room: {roomId}</h1>
      <div>
        <input
          type="text"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="From"
        />
        <input
          type="text"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="To"
        />
        <button onClick={handleMoveSubmit}>Make Move</button>
      </div>
      <div>
        <Chessboard position={game.fen()} id="BasicBoard" />
      </div>
    </div>
  );
}
