import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors"; 

const app = express();
app.use(bodyParser.json());
app.use(cors()); 

interface Room {
  [key: string]: {
    users: { [key: string]: string | null };
    gameboard: any;
  };
}

const rooms: Room = {};

// Example route
app.get("/rooms", (req: Request, res: Response) => {
  res.json({ rooms });
});

app.post("/create-room", (req: Request, res: Response) => {
    const { roomName } = req.body;
    if (!roomName) {
      return res.status(400).send("Room name is required");
    }
    rooms[roomName] = { users: {},gameboard:[]};
    console.log(rooms);
    res.status(201).json(rooms); // Send back all rooms
  });

export { app, rooms };
