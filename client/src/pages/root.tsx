import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export function Root() {
  interface Room {
    id: string;
    users: { [key: string]: string | null };
  }

  const [rooms, setRooms] = useState<Room[]>([]);
  const [room, setRoom] = useState<string>("");

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const result: AxiosResponse = await axios.get(
          "http://localhost:8080/rooms"
        );
        console.log(result.data);

        // Extract the rooms object from the data
        const roomsData = result.data.rooms;

        // Transform roomsData to an array of Room objects
        const roomsArray: Room[] = Object.keys(roomsData).map((id) => ({
          id,
          users: roomsData[id],
        }));

        setRooms(roomsArray);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        // Handle error: Set rooms to an empty array or display an error message to the user
      }
    };

    fetchRooms();
  }, [room]);

  useEffect(() => {
    // This effect is triggered whenever the rooms state changes
    console.log("Rooms:", rooms);
  }, [rooms]); // Re-run this effect whenever rooms state changes

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!room) {
      console.error("Room name is required");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/create-room", {
        roomName: room,
      });

      console.log("Room created:", response.data);

      // Clear the input field after successful submission
      setRoom("");
    } catch (error) {
      console.error("Error creating room:", error);
      // Handle error: Display an error message to the user
    }
  };

  return (
    <>
      <h1>This is the home page</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          id="roomName"
          value={room}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setRoom(e.target.value);
          }}
          name="roomName"
        />
        <button type="submit">Create Room</button>
      </form>
      <div>
        <ul>
          {rooms.map((room, index) => (
            <li key={index}>
              {room.id}
              <Link to={"/" + room.id}>Join</Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
