import { useContext } from "react";

import OtpInput from "react-otp-input";

import { GameConnectionContext } from "@/context/gameConnectionContext";

import Button from "@/ui/Button";

type StartGameProps = { code: string; onCodeChange: (code: string) => void };

const StartGame = ({ code, onCodeChange }: StartGameProps) => {
  const { updateScreen } = useContext(GameConnectionContext);

  return (
    <>
      <form className="mt-[60%]">
        <OtpInput
          value={code}
          onChange={onCodeChange}
          numInputs={6}
          containerStyle="gap-2 h-10"
          inputStyle="aspect-square outline-none border-b border-white grow text-4xl text-white font-medium rounded-md bg-transparent"
          inputType="text"
          renderInput={(props) => <input {...props} />}
          shouldAutoFocus
        />
        <p className="mt-3 text-center text-xs text-violet-200">
          Enter code or create a new game to start
        </p>
        <Button
          type="submit"
          size="lg"
          fullWidth
          className="mt-3"
          onClick={() => code.length === 6 && updateScreen("name")}
          disabled={code.length < 6}
        >
          Join Game
        </Button>
      </form>
      <div className="mt-3 flex items-center gap-3">
        <Button
          fullWidth
          onClick={() => {
            onCodeChange("");
            updateScreen("name");
          }}
        >
          Create Game
        </Button>
        <Button fullWidth>Rules</Button>
      </div>
    </>
  );
};

export default StartGame;
