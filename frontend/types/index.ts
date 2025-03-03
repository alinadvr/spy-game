export enum SocketEvent {
  CREATE_ROOM = "createRoom",
  JOIN_ROOM = "joinRoom",
  USER_JOINED = "userJoined",
  PICK_SPY = "pickSpy",
  UPDATE_ROOM = "updateRoom",
  LEAVE_ROOM = "leaveRoom",
}

export type Room = {
  id: string;
  code: string;
  theme: string;
  location: string;
  members: RoomMember[];
};

export type RoomMember = {
  id: string;
  name: string;
  role: "user" | "spy";
  isAdmin: boolean;
};
