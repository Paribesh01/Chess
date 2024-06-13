import { createServer } from "http";
import { Server } from "socket.io";
import { app } from "./app";
import { handleSocketConnections } from "./socket";

const PORT = 8080


const server = createServer(app);


const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"]
  }
});

handleSocketConnections(io);

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
