import { useContext } from "react";

import { toast } from "react-toastify";
import { StarIcon } from "@heroicons/react/24/solid";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";

import classNames from "@/utils/classNames";

import { GameConnectionContext } from "@/context/gameConnectionContext";

import Button from "@/ui/Button";

const AVATAR_COLORS = [
  "bg-emerald-700 text-emerald-100",
  "bg-cyan-700 text-cyan-100",
  "bg-violet-700 text-violet-100",
  "bg-lime-700 text-lime-100",
  "bg-indigo-700 text-indigo-100",
  "bg-blue-700 text-blue-100",
  "bg-purple-700 text-purple-100",
  "bg-fuchsia-700 text-fuchsia-100",
  "bg-red-700 text-red-100",
  "bg-pink-700 text-pink-100",
  "bg-yellow-700 text-yellow-100",
  "bg-amber-700 text-amber-100",
];

const MIN_MEMBERS = 3;

const WaitRoom = () => {
  const { room, activeUser, updateScreen, leaveGame } = useContext(
    GameConnectionContext,
  );

  const copyCode = () => {
    if (!room) return;

    navigator.clipboard.writeText(room.code);
    toast.info("Copied!");
  };

  if (!room || !activeUser) {
    updateScreen("start");

    return null;
  }

  return (
    <>
      <div className="relative mt-[65%] space-y-4">
        <div className="iems-center mb-2 flex justify-between text-nowrap text-4xl font-bold text-white">
          {room.code.split("").map((char, i) => (
            <span key={i}>{char}</span>
          ))}
          <button
            onClick={copyCode}
            className="ml-4 flex aspect-square size-14 items-center justify-center rounded-full bg-violet-800 active:bg-violet-600"
          >
            <DocumentDuplicateIcon className="w-8 text-white" />
          </button>
        </div>
        <p className="mx-auto text-center text-xs text-violet-200">
          Share this code with your friends to let them join the game (at least{" "}
          {MIN_MEMBERS} players)
        </p>
        {activeUser.isAdmin && (
          <Button
            fullWidth
            size="lg"
            disabled={room.members.length < MIN_MEMBERS}
          >
            Start Game!
          </Button>
        )}
        <button
          onClick={leaveGame}
          className="mx-auto block text-violet-800 underline"
        >
          Leave the game
        </button>
        {!activeUser.isAdmin && (
          <p className="animation-loading-text mx-auto text-center text-sm text-violet-800">
            Waiting for admin to start the game
          </p>
        )}
        <div className="flex flex-wrap gap-5">
          {room.members.map(({ id, name, isAdmin }, index) => (
            <div
              key={id}
              className={classNames(
                "relative flex size-[65px] shrink-0 items-center justify-center rounded-full text-3xl font-medium",
                AVATAR_COLORS[index],
              )}
            >
              {name
                .split(" ")
                .map((str) => str[0])
                .join("")
                .toUpperCase()}
              {isAdmin && (
                <StarIcon className="absolute -bottom-1 -right-1 w-6 text-yellow-500" />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default WaitRoom;
