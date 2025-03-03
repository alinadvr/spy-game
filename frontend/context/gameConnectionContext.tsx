"use client";

import { createContext, useEffect, useState } from "react";

import { toast } from "react-toastify";
import { io, Socket } from "socket.io-client";

import { Room, RoomMember, SocketEvent } from "@/types";

export const SCREENS = ["start", "name", "wait", "loading", "role"] as const;

type Screen = (typeof SCREENS)[number];

type GameConnectionContextType = {
  room?: Room;
  socket?: Socket;
  screen: Screen;
  activeUser?: RoomMember;
  updateScreen: (screen: Screen) => void;
  createGame: (userName: string) => void;
  joinGame: (code: string, userName: string) => void;
  leaveGame: () => void;
};

export const GameConnectionContext = createContext<GameConnectionContextType>({
  screen: SCREENS[0],
  updateScreen: (screen) => console.log(`update screen to: ${screen}`),
  createGame: () => console.log("create a game"),
  joinGame: () => console.log("join a game"),
  leaveGame: () => console.log("leave the game"),
});

export const GameConnectionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [room, setRoom] = useState<Room>();
  const [socket, setSocket] = useState<Socket>();
  const [screen, setScreen] = useState<Screen>(SCREENS[0]);
  const [activeUser, setActiveUser] = useState<RoomMember>();

  // Socket IO connection
  useEffect(() => {
    console.info("Connect");

    const socket = io(process.env.NEXT_PUBLIC_SERVER_URL, {
      query: { userId: localStorage.getItem("userId") },
    });

    socket.on("connect", () => {
      console.info("Connected to server");
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

    socket.on(
      SocketEvent.USER_JOINED,
      ({ room, activeUser }: { room: Room; activeUser: RoomMember }) => {
        setRoom(room);
        setActiveUser(activeUser);
        setScreen("wait");

        localStorage.setItem("userId", activeUser.id);
      },
    );

    socket.on(SocketEvent.UPDATE_ROOM, (room: Room) => {
      setRoom(room);
    });

    socket.on(SocketEvent.PICK_SPY, ({ spyIds }: { spyIds: string[] }) => {
      console.log("spy ids", spyIds);

      setActiveUser((activeUser) => {
        console.log(
          activeUser && spyIds.includes(activeUser.id)
            ? { ...activeUser, role: "spy" }
            : activeUser,
        );

        return activeUser && spyIds.includes(activeUser.id)
          ? { ...activeUser, role: "spy" }
          : activeUser;
      });

      setScreen("role");
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

  const createGame = (userName: string) => {
    if (!socket) return toast.error("Could not connect to game");

    socket.emit(SocketEvent.CREATE_ROOM, { name: userName });
  };

  const joinGame = (code: string, userName: string) => {
    if (!socket) return toast.error("Could not connect to game");

    if (!code || !userName)
      return toast.error(
        "You have not provided the game code and/or your name. Please, do this and try again!",
      );

    socket.emit(SocketEvent.JOIN_ROOM, { name: userName, code });
  };

  const leaveGame = () => {
    if (!socket) return console.error("Could not connect to the game");

    if (!room || !activeUser)
      return toast.error("User does not connected to a game");

    socket.emit(SocketEvent.LEAVE_ROOM, {
      roomId: room.id,
      memberId: activeUser.id,
    });

    localStorage.removeItem("userId");

    setRoom(undefined);
    setActiveUser(undefined);
    setScreen("start");
  };

  return (
    <GameConnectionContext.Provider
      value={{
        room,
        activeUser,
        socket,
        screen,
        updateScreen: setScreen,
        createGame,
        joinGame,
        leaveGame,
      }}
    >
      {children}
    </GameConnectionContext.Provider>
  );
};
