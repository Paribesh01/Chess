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
  const [color, setColor] = useState<any>();
  const [gamefen, setGamefen] = useState<string>(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  );
  const [innertext, setInnertext] = useState<string>("");
  const { roomId } = useParams<{ roomId: string }>();
  const [gameover, setGameover] = useState<boolean>(false);

  useEffect(() => {
    socket.emit("join room", roomId);

    socket.on("message", (data: Message) => {
      if (data.type === "move" && data.chessfen) {
        setGamefen(data.chessfen);
      }
      if (data.type === "gameOver" && data.chessfen) {
        setGamefen(data.chessfen);
        setGameover(true);
        setInnertext(
          `Game over and ${data.winner === "w" ? "Black" : "White"} wins`
        );
        console.log("Game Over");
      }
    });

    socket.on("color", (value: string) => {
      setColor(value);
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

  useEffect(() => {
    // Check whose turn it is and update innertext accordingly
    const currentTurn = gamefen.split(" ")[1];
    if (gameover) return;
    if (
      (currentTurn === "w" && color === "white") ||
      (currentTurn === "b" && color === "black")
    ) {
      setInnertext("It's your turn!");
    } else {
      setInnertext("It's your opponent's turn.");
    }
  }, [gamefen, color]);

  const makeAMove = (from: string, to: string) => {
    if (gameover) return;

    console.log("move Sent");

    socket.emit("message", {
      type: "move",
      room: roomId,
      move: { from, to },
    });
  };

  function onDrop(sourceSquare: string, targetSquare: string) {
    // Extract the turn from the FEN string (last space-separated value)
    const currentTurn = gamefen.split(" ")[1];

    if (
      (currentTurn === "w" && color === "white") ||
      (currentTurn === "b" && color === "black")
    ) {
      makeAMove(sourceSquare, targetSquare);

      return true;
    } else {
      console.log(`It's not your turn.`);
      return false;
    }
  }

  return (
    <div>
      <h1>Room: {roomId}</h1>
      <h1>You are playing as {color}</h1>
      <h1>{innertext}</h1>
      <div>
        <Chessboard
          position={gamefen}
          onPieceDrop={onDrop}
          boardWidth={400}
          id="BasicBoard"
          boardOrientation={color}
        />
      </div>
    </div>
  );
}
