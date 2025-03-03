"use client";

import { useState, useContext } from "react";

import { GameConnectionContext } from "@/context/gameConnectionContext";

import StartGame from "@/components/StartGame";
import EnterName from "@/components/EnterName";
import WaitRoom from "@/components/WaitRoom";

const Home = () => {
  const [code, setCode] = useState<string>("");

  const { activeUser, screen } = useContext(GameConnectionContext);

  return (
    <div className="mx-auto mb-10 max-w-80">
      {screen === "start" ? (
        <StartGame code={code} onCodeChange={setCode} />
      ) : screen === "name" ? (
        <EnterName code={code} />
      ) : screen === "wait" ? (
        <WaitRoom />
      ) : screen === "loading" ? (
        <p>loading</p>
      ) : (
        screen === "role" && (
          <p>you are {activeUser?.role === "spy" ? "" : "not"} a spy</p>
        )
      )}
    </div>
  );
};

export default Home;
