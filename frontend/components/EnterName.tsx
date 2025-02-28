import { useContext, useState } from "react";

import { ArrowLeftIcon } from "@heroicons/react/24/solid";

import { GameConnectionContext } from "@/context/gameConnectionContext";

import Button from "@/ui/Button";

const EnterName = ({ code }: { code: string }) => {
  const [name, setName] = useState<string>("");

  const { createGame, joinGame, updateScreen } = useContext(
    GameConnectionContext,
  );

  return (
    <>
      <Button
        size="sm"
        onClick={() => updateScreen("start")}
        className="fixed left-3 top-3 flex items-center gap-2"
      >
        <ArrowLeftIcon className="w-4" />
        Back
      </Button>
      <form className="mt-[60%]" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="name" className="text-xs text-violet-200">
          Enter your name to start a game
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-10 w-full rounded-full bg-violet-200/50 px-5 text-xl text-white outline-none"
          autoFocus
        />
        <Button
          type="submit"
          size="lg"
          fullWidth
          className="mt-5"
          onClick={() =>
            name.trim().length > 0 && code.length === 0
              ? createGame(name)
              : joinGame(code, name)
          }
          disabled={name.trim().length === 0}
        >
          Join Game
        </Button>
      </form>
    </>
  );
};

export default EnterName;
