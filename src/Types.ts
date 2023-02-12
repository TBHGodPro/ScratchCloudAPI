import Variable from "./Variable";

/** Events for the CloudSession */
export interface Events {
	/** The Session Is Connected */
	connected: () => void;
	/** A Variable Has Been Set (Passes The Variable) */
	set: (variable: Variable) => void;
	/** A Variable Has Been Created (Passes The Variable) */
	create: (variable: Variable) => void;
	/** A Variable Has Been Deleted (Passes The Variable With Value As `null`) */
	delete: (variable: Variable) => void;
}

/** Events for the CloudWebsocket */
export interface WebsocketEvents {
	/** The WebSocket Is Connected */
	connected: () => void;
	/** A Variable Has Been Set (Passes The Variable `name` and `value`) */
	set: (name: string, value: string) => void;
	/** A Variable Has Been Created (*/
	create: (name: string, value: string) => void;
	/** A Variable Has Been Deleted */
	delete: (name: string) => void;
	/** A Variable Has Been Created Successfully */
	ack: (name: string, reply: string) => void;
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
export type PacketMethod = "handshake" | "set" | "create" | "delete";

export interface RequestOptions {
	path: string;
	method: string;
	body?: any;
	headers?: { [key: string]: any };
	sessionId?: string;
	hostname?: string;
}
