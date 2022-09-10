import { EventEmitter } from "stream";
import WebSocket from "ws";
import { CLOUD_SERVER, SERVER } from "./utils";
import TypedEmitter from "typed-emitter";
import { Events } from "./Types";

export default class CloudWebsocket extends (EventEmitter as new () => TypedEmitter<Events>) {
	public socket: WebSocket;

	public sessionId: string;
	public username: string;
	public projectId: string;

	constructor(sessionId: string, username: string, projectId: string) {
		super();

		this.sessionId = sessionId;
		this.username = username;
		this.projectId = projectId;

		this.socket = new WebSocket(CLOUD_SERVER, [], {
			headers: {
				cookie: "scratchsessionsid=" + this.sessionId + ";",
				origin: SERVER
			}
		});

		this.socket.on("open", () => {
			this._send("handshake", {});
			this.emit("connected");
		});

		var stream = "";
		this.socket.on("message", chunk => {
			stream += chunk;
			var packets = stream.split("\n");
			for (var i = 0; i < packets.length - 1; i++) {
				var line = packets[i];
				var packet: any;
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
			this.emit("close", code, reason);
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

	public _sendSet(name: string, value: string) {
		this._send("set", {
			name: `☁ ${name}`,
			value: value.toString()
		});
	}

	private _send(method: string, options: any = {}) {
		const data = {
			user: this.username,
			project_id: this.projectId,
			method,
			...options
		};
		this.socket.send(JSON.stringify(data) + "\n");
	}
}
