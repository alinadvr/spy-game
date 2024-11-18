import { createServer } from "http";
import express, { Express, Request, Response } from "express";

import { uid } from "uid";
import { Server, Socket } from "socket.io";

import { Room, SocketEvent } from "./types";

const app: Express = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3001", "http://vagauto.in.ua"], // Allow requests from this origin
    methods: ["GET", "POST"], // Allow these HTTP methods
  },
});
const port = 3002;

const rooms: Room[] = [];

app.get("/spy-game-server", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

io.on("connection", async (socket: Socket) => {
  console.log("a user connected");

  socket.on(SocketEvent.CREATE_ROOM, ({ name }: { name: string }) => {
    let code = uid(8);
    let roomId = uid(20);

    // Check if user connected to room
    if (socket.rooms.size >= 2) {
      io.to(socket.rooms.values().next().value!).emit("message", {
        type: "error",
        content: "Already connected to game",
      });

      return;
    }

    // Check code and room are unique
    while (true) {
      socket.join(roomId);
      const existRoom = rooms.find((room) => room.id === roomId);
      const existCode = rooms.find((room) => room.code === code);

      if (!existCode && !existRoom) break;
      if (existCode) code = uid(8);
      if (existRoom) roomId = uid(20);
    }

    socket.join(roomId);

    const room: Room = {
      id: roomId,
      code,
      theme: "Culture",
      location: "Theatre",
      members: [{ name, role: "user", isAdmin: true }],
    };

    rooms.push(room);

    socket.emit(SocketEvent.ROOM_INFO, room);

    console.info(`User ${name} created the room with code ${code}`);
  });

  socket.on(
    SocketEvent.JOIN_ROOM,
    ({ name, code }: { name: string; code: string }) => {
      // Check if user connected to room
      if (socket.rooms.size >= 2) {
        io.to(socket.rooms.values().next().value!).emit("message", {
          type: "error",
          content: "Already connected to game",
        });

        return;
      }

      const room = rooms.find((room) => room.code === code);

      if (room) {
        socket.join(room.id);

        room.members.push({ name, role: "user", isAdmin: false });

        socket.emit(SocketEvent.ROOM_INFO, room);

        console.info(`User ${name} joined the room with code ${code}`);
      } else {
        console.error(`Room with code ${code} does not exist`);
      }
    }
  );

  socket.on(
    "message",
    ({ roomId, message }: { message: string; roomId: string }) => {
      console.log("got message", message);
      socket.to(roomId).emit("message", message);
    }
  );

  socket.on(SocketEvent.LEAVE_ROOM, ({ roomId }: { roomId: string }) => {
    socket.leave(roomId);
  });

  socket.on("disconnecting", () => {
    console.log("disconnecting", socket.rooms);
  });

  socket.on("disconnect", () => {
    console.log("disconnect", socket.rooms);
  });
});

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
