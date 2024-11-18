"use client";

import { useEffect, useState } from "react";

import { toast } from "react-toastify";
import { io, Socket } from "socket.io-client";

import { Room, SocketEvent } from "@/types";

import Button from "@/components/Button";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";

const Home = () => {
  const [room, setRoom] = useState<Room>();
  const [code, setCode] = useState<string>("");
  const [socket, setSocket] = useState<Socket>();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Socket IO connection
  useEffect(() => {
    console.info("Connect");

    const socket = io(process.env.NEXT_PUBLIC_SERVER_URL);

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
    setIsAdmin(true);
  };

  const handleJoinRoom = () => {
    if (!socket || typeof code !== "string")
      return console.error("Could not connect to socket");

    socket.emit(SocketEvent.JOIN_ROOM, { name: "player", code });
    setCode("");
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
    <div className="mx-auto max-w-80">
      {!room ? (
        <>
          <p className="mt-1.5 text-center text-xs text-violet-200">
            Enter code or create a new game to start
          </p>
          <div className="relative mt-[55%]">
            <div className="absolute bottom-0 flex justify-between gap-2">
              {Array(8)
                .fill(null)
                .map((_, i) => (
                  <hr
                    key={i}
                    className="h-2 w-8 rounded-full border-violet-300"
                  />
                ))}
            </div>
            <input
              type="text"
              minLength={8}
              maxLength={8}
              onChange={(e) => setCode(e.target.value ?? "")}
              className="h-14 w-full bg-transparent px-1 text-4xl tracking-[0.9ch] text-white outline-none"
            />
          </div>
          <Button
            size="lg"
            fullWidth
            className="mt-5"
            onClick={handleJoinRoom}
            disabled={code.length < 8}
          >
            Join a Game
          </Button>
          <div className="mt-3 flex items-center gap-4">
            <Button fullWidth onClick={handleCreateRoom}>
              Create a Game
            </Button>
            <Button fullWidth>Read the Rules</Button>
          </div>
        </>
      ) : (
        <>
          <p className="mx-auto mt-1.5 max-w-[80%] text-center text-xs text-violet-200">
            Share this code with your friends to let them join the game
          </p>
          <div className="relative mt-[50%] space-y-4">
            <div className="mb-2 flex items-center justify-between text-nowrap text-4xl font-bold text-white">
              {room.code.split("").map((char, i) => (
                <span key={i}>{char}</span>
              ))}
              <button
                onClick={handleCopyCode}
                className="ml-4 flex aspect-square size-14 items-center justify-center rounded-full bg-violet-800 active:bg-violet-600"
              >
                <DocumentDuplicateIcon className="w-8 text-white" />
              </button>
            </div>
            {isAdmin && (
              <Button fullWidth size="lg" disabled={room.members.length < 3}>
                Start Game!
              </Button>
            )}
            <Button fullWidth onClick={handleSendMessage}>
              Send Message
            </Button>
            <button
              onClick={handleLeaveRoom}
              className="mx-auto block text-violet-800"
            >
              Leave the game
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
