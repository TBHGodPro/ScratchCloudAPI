import { EventEmitter } from "node:events";
import WebSocket from "ws";
import TypedEmitter from "./TypedEmitter";
import { PacketMethod, WebsocketEvents } from "./Types";

/** A Cloud WebSocket */
export default class CloudWebsocket extends (EventEmitter as new () => TypedEmitter<WebsocketEvents>) {
	/** The Raw WebSocket for the CloudWebsocket */
	public socket?: WebSocket;

	/** The Session ID */
	public sessionId: string;
	/** The User Username */
	public username: string;
	/** The Session Project ID */
	public projectId: string;
	/** Packets that failed to send due to disconnects */
	public attempted_packets: { [key: string]: string }[] = [];

	/** The Cloud Server that the WebSocket is hosting on */
	public CLOUD_SERVER: string;

	/**
	 * A Cloud Websocket
	 * @param sessionId The Session ID
	 * @param username The User Username
	 * @param projectId The Session Project ID
	 * @param CLOUD_SERVER The Cloud Server that the WebSocket is hosting on
	 */
	constructor(sessionId: string, username: string, projectId: string, CLOUD_SERVER: string) {
		super();

		this.sessionId = sessionId;
		this.username = username;
		this.projectId = projectId;
		this.CLOUD_SERVER = CLOUD_SERVER;
		this.attempted_packets = [];

		this._setup();
	}

	private _setup() {
		this.socket = null;
		this.socket = new WebSocket(this.CLOUD_SERVER, [], {
			headers: {
				cookie: "scratchsessionsid=" + this.sessionId + ";",
				origin: "https://scratch.mit.edu"
			}
		});

		this.socket.on("open", () => {
			this.send("handshake", {});
			for (const packet of this.attempted_packets) this.sendRaw(packet);
			this.attempted_packets = [];
			this.emit("connected", "connected");
		});

		let stream = "";
		this.socket.on("message", chunk => {
			stream += chunk;
			const packets = stream.split("\n");
			for (let i = 0; i < packets.length - 1; i++) {
				const line = packets[i];
				let packet: any;
				try {
					packet = JSON.parse(line);
				} catch (err) {
					console.warn("Invalid packet %s", line);
					return;
				}
				this._handlePacket(packet);
			}
			stream = packets[packets.length - 1];
		});

		this.socket.on("close", (code, reason) => {
			this._setup();
		});
	}

	private _handlePacket(packet) {
		switch (packet.method) {
			case "set":
				this.emit("set", packet.name.substring(2), packet.value.toString());
				break;
			default:
				console.log("\n\n\nUNKOWN PACKET:\n");
				console.log(packet);
				console.log("\n\n\n");
				break;
		}
	}

	/**
	 * Send a set packet
	 * @param name The variable name
	 * @param value The variable value
	 */
	public _sendSet(name: string, value: string) {
		this.send("set", {
			name: `☁ ${name}`,
			value: value.toString()
		});
	}

	/**
	 * Send a packet
	 * @param method The packet method
	 * @param data Extra data for the packet
	 */
	public send(method: PacketMethod, data: { [key: string]: string } = {}) {
		const sendData = {
			user: this.username,
			project_id: this.projectId,
			method,
			...data
		};
		if (this.socket?.readyState === WebSocket.OPEN) this.sendRaw(sendData);
		else this.attempted_packets.push(sendData);
	}

	/**
	 *	Send a raw packet
	 * @param data The data in the packet
	 */
	public sendRaw(data: { [key: string]: string }) {
		this.socket.send(JSON.stringify(data) + "\n");
	}
}
