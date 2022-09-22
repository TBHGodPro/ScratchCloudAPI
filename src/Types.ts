import Variable from "./Variable";

/** Events for the CloudSession */
export interface Events {
	/** The Session Is Connected */
	connected: () => void;
	/** A Variable Has Been Set (Passes The Variable) */
	set: (variable: Variable) => void;
}

/** Events for the CloudWebsocket */
export interface WebsocketEvents {
	/** The WebSocket Is Connected */
	connected: (connected: "connected") => void;
	/** A Variable Has Been Set (Passes The Variable `name` and `value`) */
	set: (name: string, value: string) => void;
}

export interface User {
	/** The User Username */
	username: string;
	/** The User Login Token */
	token: string;
	/** The User ID */
	id: number;
}

/** Methods for a packet */
export type PacketMethod = "handshake" | "set";
