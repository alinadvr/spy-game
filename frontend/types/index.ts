export enum SocketEvent {
  CREATE_ROOM = "createRoom",
  JOIN_ROOM = "joinRoom",
  ROOM_INFO = "roomInfo",
  LEAVE_ROOM = "leaveRoom",
}

export type Room = {
  id: string;
  code: string;
  theme: string;
  location: string;
};

export type RoomMember = {
  name: string;
  role: "user" | "spy";
  isAdmin: boolean;
};
