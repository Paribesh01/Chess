import { Server, Socket } from "socket.io";
import { rooms } from "./app";
import { Chess } from "chess.js";
import { constrainedMemory } from "process";

export const handleSocketConnections = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("a user connected");
    var chess: any = new Chess();
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });

    socket.on("join room", (room: string) => {
      if (Object.keys(rooms[room].users).length < 2) {
        socket.join(room);
        rooms[room].users[socket.id] = "";
        console.log(rooms);
        console.log(`User joined room: ${room}`);
      } else {
        console.log(`Room ${room} is full. User cannot join.`);

        socket.emit("room full", room); // Notify the user that the room is full
      }
      if (Object.keys(rooms[room].users).length == 2) {
        const userIds = Object.keys(rooms[room].users);
        rooms[room].users[userIds[0]] = "white";
        rooms[room].users[userIds[1]] = "black";
        chess = new Chess();
      }
    });

    socket.on("message", (data:any) => {
      const { room, type } = data;

      if (rooms[room]) {
        if (type == "move") {
          try {
            const move = chess.move({ from: data.move.from, to: data.move.to });
            console.log(move);
            rooms[room].gameboard.push(data.move);
            console.log(`Move received for room ${room}:`, data.move);
            console.log(rooms[room]);
            socket.to(room).emit("message", {
              type: "move",
              from: data.move.from,
              to: data.move.to,
            });
            console.log(chess.ascii());

            io.to(room).emit("message",{type:"move",move:{
              
              from: data.move.from, to: data.move.to 
            } 
          } );// this is not woking
          } catch (e) {
            console.log("error Move")
            socket.emit("error", { message: "Invalid move" });
          }
        }
      } else {
        console.log(`Room ${room} not found for move`);
      }
    });

    socket.on("leave room", (room: string) => {
      socket.leave(room);
      if (rooms[room] && rooms[room].users[socket.id]) {
        delete rooms[room].users[socket.id];
      }
      console.log(`User left room: ${room}`);
    });
  });
};
