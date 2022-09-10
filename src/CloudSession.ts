import { EventEmitter } from "stream";
import TypedEmitter from "typed-emitter";
import { Events, User, Variable } from "./Types";
import { request, parseCookie } from "./utils";
import CloudWebsocket from "./CloudWebsocket";

export default class CloudSession extends (EventEmitter as new () => TypedEmitter<Events>) {
	public connection: CloudWebsocket;

	public user: User;
	public username: string;
	public id: number;
	public projectId: string;
	public variables: Variable[] = [];

	private sessionId: string;

	constructor(username: string, password: string, projectId: string) {
		super();

		this.username = username;
		this.projectId = projectId;

		this._login(password);
	}

	private async _login(password: string) {
		const reqBody = JSON.stringify({
			username: this.username,
			password
		});
		// @ts-ignore
		const { body, response } = await request({
			path: "/login/",
			method: "POST",
			body: reqBody,
			headers: { "X-Requested-With": "XMLHttpRequest" }
		});
		var user = JSON.parse(body)[0];
		if (user.msg) throw new Error(user.msg);
		this.user = user;
		this.username = this.user.username;
		this.id = this.user.id;
		this.sessionId = (
			parseCookie(response.headers["set-cookie"][0]) as {
				scratchsessionsid: string;
			}
		).scratchsessionsid;
		this._setup();
	}

	private _set(name: string, value: string) {
		this.variables.find(i => i.name == name) ? (this.variables[this.variables.indexOf(this.variables.find(i => i.name == name))].value = value) : this.variables.push({ name, value });
	}

	private _setup() {
		this.variables = [];
		this.connection = new CloudWebsocket(this.sessionId, this.username, this.projectId);

		this.connection.on("connected", () => this.emit("connected"));
		this.connection.on("set", (name, value) => {
			this.emit("set", name, value);
			this._set(name, value);
		});

		this.connection.on("close", () => {
			this.connection = null;
			this.connection = new CloudWebsocket(this.sessionId, this.username, this.projectId);
		});
	}

	public get(name: string) {
		return this.variables.find(i => i.name == name).value;
	}

	public set(name: string, value: string) {
		if (!value) value = "";
		this.connection._sendSet(name, value);
		this._set(name, value);
	}
}
