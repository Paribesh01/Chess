import { Server, Socket } from "socket.io";
import { rooms } from "./app";
import { Chess } from "chess.js";

// Declare a global object to hold game instances for each room
const games: Record<string, Chess> = {};

export const handleSocketConnections = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("a user connected");

    socket.on("disconnect", () => {
      console.log("user disconnected");
      handleDisconnect(socket);
    });

    socket.on("join room", (room: string) => {
      if (!games[room]) {
        games[room] = new Chess(); // Initialize a new game if it doesn't exist for the room
      }

      if (Object.keys(rooms[room].users).length < 2) {
        socket.join(room);
        rooms[room].users[socket.id] = "";

        if (Object.keys(rooms[room].users).length === 2) {
          const userIds = Object.keys(rooms[room].users);
          rooms[room].users[userIds[0]] = "white";
          rooms[room].users[userIds[1]] = "black";

          io.to(userIds[0]).emit("color", "white");
          io.to(userIds[1]).emit("color", "black");
         
          io.to(room).emit("message", { type: "gameStart", chessfen: games[room].fen() });
        }
      } else {
        socket.emit("room full", room);
      }
    });

    socket.on("message", (data: any) => {
      const { room, type } = data;

      if (rooms[room]) {
        if (type === "move") {
          try {
            const move = games[room].move({ from: data.move.from, to: data.move.to });
            if(games[room].isGameOver()){

              console.log("Game Over");
              console.log(games[room].turn)
              io.to(room).emit("message",{type:"gameOver",chessfen: games[room].fen(),winner:games[room].turn()})
            }
              
            else if(move) {  
              rooms[room].gameboard.push(move);
              console.log(games[room].ascii())
              io.to(room).emit("message", {
                type: "move",
                from: move.from,
                to: move.to,
                chessfen: games[room].fen()
              });
            } else {
              io.to(room).emit("error", { message: "Invalid move" });
            }
          } catch (e) {
            console.error("Error during move:", e);
            socket.emit("error", { message: "Server error during move" });
          }
        }
      }
    });

    socket.on("leave room", (room: string) => {
      handleLeaveRoom(socket, room);
    });
  });

  function handleDisconnect(socket: Socket) {
    Object.keys(rooms).forEach((room) => {
      if (rooms[room].users[socket.id]) {
        handleLeaveRoom(socket, room);
      }
    });
  }

  function handleLeaveRoom(socket: Socket, room: string) {
    socket.leave(room);
    if (rooms[room] && rooms[room].users[socket.id]) {
      delete rooms[room].users[socket.id];
      console.log(`User left room: ${room}`);
      if (Object.keys(rooms[room].users).length === 0) {
        delete rooms[room];
        delete games[room]; // Cleanup the game instance when the room is empty
        console.log(`Room ${room} deleted`);
      }
    }
  }
};
