import { createServer } from "http";
import express, { Express, Request, Response } from "express";

import { uid } from "uid";
import { Server, Socket } from "socket.io";

import { Room, RoomMember, SocketEvent } from "./types";

import random from "./utils/random";

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

app.get("/", (req: Request, res: Response) => {
  console.log("rooms", rooms);
  res.send("Express + TypeScript Server");
});

io.on("connection", async (socket: Socket) => {
  console.log("a user connected");

  // Check if user was joined to room
  const userId = socket.handshake.query.userId;
  const room = userId
    ? rooms.find(({ members }) => members.find(({ id }) => userId === id))
    : undefined;

  if (room) {
    io.to(socket.rooms.values().next().value!).emit(SocketEvent.USER_JOINED, {
      room,
      activeUser: room.members.find(({ id }) => id === userId),
    });
  }

  socket.on(SocketEvent.CREATE_ROOM, ({ name }: { name: string }) => {
    let code = uid(6);
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
      if (existCode) code = uid(6);
      if (existRoom) roomId = uid(20);
    }

    socket.join(roomId);

    const member: RoomMember = {
      id: uid(8),
      name,
      role: "user",
      isAdmin: true,
    };
    const room: Room = {
      id: roomId,
      code,
      theme: "Culture",
      location: "Theatre",
      members: [member],
    };
    const userRoom = socket.rooms.values().next().value!;

    rooms.push(room);

    io.to(userRoom).emit(SocketEvent.USER_JOINED, { room, activeUser: member });

    console.info(`User ${name} created the room with code ${code}`);
  });

  socket.on(
    SocketEvent.JOIN_ROOM,
    ({ name, code }: { name: string; code: string }) => {
      const userRoom = socket.rooms.values().next().value!;

      // Check if user connected to room
      if (socket.rooms.size >= 2) {
        io.to(userRoom).emit("message", {
          type: "error",
          content: "Already connected to game",
        });

        return;
      }

      const room = rooms.find((room) => room.code === code);

      if (!room) {
        console.error(`Room with code ${code} does not exist`);

        io.to(userRoom).emit("message", {
          type: "error",
          content: "Game with this code does not exist",
        });

        return;
      }

      if (room.members.length >= 12) {
        console.error(`Room with code ${code} is full`);

        io.to(userRoom).emit("message", {
          type: "error",
          content: "Game with this code is full",
        });

        return;
      }

      socket.join(room.id);

      const member: RoomMember = {
        id: uid(8),
        name,
        role: "user",
        isAdmin: !room.members.find(({ isAdmin }) => isAdmin),
      };

      room.members.push(member);

      io.to(userRoom).emit(SocketEvent.USER_JOINED, {
        room,
        activeUser: member,
      });

      socket.to(room.id).emit(SocketEvent.UPDATE_ROOM, room);

      console.info(`User ${name} joined the room with code ${code}`);
    }
  );

  socket.on(
    "message",
    ({ roomId, message }: { message: string; roomId: string }) => {
      console.log("got message", message);
      socket.to(roomId).emit("message", message);
    }
  );

  socket.on(
    SocketEvent.LEAVE_ROOM,
    ({ memberId, roomId }: { memberId: string; roomId: string }) => {
      const room = rooms.find(({ id }) => id === roomId);
      const member = room?.members.find(({ id }) => id === memberId);

      if (room && member) {
        room.members.splice(room.members.indexOf(member), 1);

        if (member.isAdmin && room.members[0]) room.members[0].isAdmin = true;
      }

      socket.to(roomId).emit(SocketEvent.UPDATE_ROOM, room);
      socket.leave(roomId);

      if (room?.members.length === 0) {
        rooms.splice(rooms.indexOf(room), 1);
      }
    }
  );

  socket.on(SocketEvent.PICK_SPY, ({ roomId }: { roomId: string }) => {
    const room = rooms.find(({ id }) => id === roomId);

    if (!room) {
      console.error(`Room with roomId ${roomId} not found`);

      io.to(roomId).emit("message", {
        type: "error",
        content: "Game could not be started. Game is not found.",
      });

      return;
    }

    let spiesCount =
      room.members.length <= 6 ? 1 : room.members.length <= 10 ? 2 : 3;
    // array of member indexes
    let activeSpies: number[] = [];

    while (activeSpies.length < spiesCount) {
      // pick random member by index
      let i: number = -1;

      while (activeSpies.includes(i) || i === -1) {
        i = Math.round(random(0, room.members.length - 1));
      }

      console.log(room.members, i, room.members[i]);

      activeSpies.push(i);
      room.members[i].role = "spy";
    }

    io.to(roomId).emit(SocketEvent.PICK_SPY, {
      spyIds: room.members
        .filter(({ role }) => role === "spy")
        .flatMap(({ id }) => id),
    });
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
