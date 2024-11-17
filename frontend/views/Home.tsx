"use client";

import { FormEvent, useEffect, useState } from "react";

import { toast } from "react-toastify";
import { io, Socket } from "socket.io-client";

import { Room, SocketEvent } from "@/types";

import Button from "@/components/Button";

const Home = () => {
  const [socket, setSocket] = useState<Socket>();
  const [room, setRoom] = useState<Room>();

  // Socket IO connection
  useEffect(() => {
    console.info("Connect");

    const socket = io("ws://localhost:3001");

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    setSocket(socket);

    socket.on("message", (message) => {
      console.info("Message", message, typeof message);

      if (typeof message === "string") {
        toast.info(message);
      } else if (typeof message === "object") {
        const toaster =
          message.type === "error"
            ? toast.error
            : message.type === "warning"
              ? toast.warning
              : message.type === "success"
                ? toast.success
                : toast.info;

        toaster(message.content);
      }
    });

    socket.on(SocketEvent.ROOM_INFO, (data: Room) => {
      setRoom(data);
    });

    socket.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
    });

    socket.on("error", (err) => {
      console.error("Error:", err.message);
    });

    socket.on("disconnect", () => {
      console.info("Disconnected");
      setRoom(undefined);
    });

    return () => {
      console.info("Close connection");
      socket.disconnect();
    };
  }, []);

  const handleCreateRoom = () => {
    if (!socket) return console.error("Could not connect to socket");

    socket.emit(SocketEvent.CREATE_ROOM, { name: "admin" });
  };

  const handleJoinRoom = (event: FormEvent) => {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form as HTMLFormElement);
    const code = formData.get("code")?.valueOf();

    if (!socket || typeof code !== "string")
      return console.error("Could not connect to socket");

    socket.emit(SocketEvent.JOIN_ROOM, { name: "player", code });
  };

  const handleSendMessage = () => {
    if (!socket) return console.error("Could not connect to socket");

    if (!room) return console.error("Room is not connected");

    socket.emit("message", { message: "hi", roomId: room.id });
  };

  const handleLeaveRoom = () => {
    if (!socket) return console.error("Could not connect to socket");

    if (!room) return toast.error("User does not connected to game");

    socket.emit(SocketEvent.LEAVE_ROOM, { roomId: room.id });
    setRoom(undefined);
  };

  const handleCopyCode = () => {
    if (!room) return;

    navigator.clipboard.writeText(room.code);
    toast.info("Copied!");
  };

  return (
    <div className="my-10 flex flex-col items-center gap-6">
      {room ? (
        <>
          <div className="flex items-center gap-2">
            <p className="text-center">{room.code}</p>
            <button
              type="button"
              onClick={handleCopyCode}
              className="rounded-full bg-gray-300 p-1 text-xs font-medium text-gray-700 transition-all enabled:hover:bg-gray-400 enabled:active:scale-[0.98]"
            >
              Copy
            </button>
          </div>
          <Button onClick={handleSendMessage}>Send message</Button>
          <Button onClick={handleLeaveRoom}>Leave game</Button>
        </>
      ) : (
        <>
          <Button onClick={handleCreateRoom}>Create a room</Button>
          <form
            onSubmit={handleJoinRoom}
            className="flex items-center justify-center gap-4"
          >
            <input
              type="text"
              name="code"
              placeholder="Room Code"
              minLength={8}
              maxLength={8}
              className="rounded-full border px-3 py-1.5 outline-none"
            />
            <Button type="submit">Join room</Button>
          </form>
        </>
      )}
    </div>
  );
};

export default Home;
