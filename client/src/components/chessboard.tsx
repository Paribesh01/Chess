import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useState } from "react";

export default function Board() {
  const [game, setgame] = useState(new Chess());

  function makeAMove(move: any) {
    const gameCopy: any = { ...game };
    const result = gameCopy.move(move);
    setgame(gameCopy);
    return result; // null if the move was illegal, the move object if the move was legal
  }

  return (
    <>
      <Chessboard position={game.fen()} id="BasicBoard"></Chessboard>
    </>
  );
}
