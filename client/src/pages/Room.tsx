import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../socket";
import { Chessboard } from "react-chessboard";

interface Message {
  type: string;
  chessfen?: string;
  winner?: string;
}

export function Room() {
  const [gamefen, setGamefen] = useState<string>(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  );
  const [innertext, setinnertext] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const { roomId } = useParams<{ roomId: string }>();

  useEffect(() => {
    socket.emit("join room", roomId);

    socket.on("message", (data: Message) => {
      if (data.type === "move" && data.chessfen) {
        setGamefen(data.chessfen);
      }
      if (data.type == "gameOver") {
        setGamefen("");
        setinnertext(
          `Game over and ${data.winner === "w" ? "Black" : "White"} wins`
        );
        console.log("Game Over");
      }
    });

    socket.on("error", (error: any) => {
      console.error("Error from server:", error.message);
    });

    return () => {
      socket.emit("leave room", roomId);
      socket.off("message");
      socket.off("error");
    };
  }, [roomId]);

  const makeAMove = (from: string, to: string) => {
    console.log("move Sent");

    socket.emit("message", {
      type: "move",
      room: roomId,
      move: { from, to },
    });
  };

  const handleMoveSubmit = () => {
    makeAMove(from, to);
    setFrom(""); // Clear the input fields after move
    setTo("");
  };

  function onDrop(sourceSquare: string, targetSquare: string) {
    makeAMove(sourceSquare, targetSquare);
    // Since the move validation is done on the server,
    // we do not need to return a value here
    return true;
  }

  return (
    <div>
      <h1>Room: {roomId}</h1>
      <h1>{innertext}</h1>

      <div>
        <input
          type="text"
          id="from"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="From"
        />
        <input
          type="text"
          id="to"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="To"
        />
        <button onClick={handleMoveSubmit}>Make Move</button>
      </div>
      <div>
        <Chessboard
          position={gamefen}
          onPieceDrop={onDrop}
          boardWidth={400}
          id="BasicBoard"
        />
      </div>
    </div>
  );
}
