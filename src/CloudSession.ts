import { EventEmitter, once } from "node:events";
import CloudWebsocket from "./CloudWebsocket";
import TypedEmitter from "./TypedEmitter";
import { Events, User } from "./Types";
import { parseCookie, request } from "./utils";
import Variable from "./Variable";

/** A Cloud Session */
export default class CloudSession extends (EventEmitter as new () => TypedEmitter<Events>) {
	/** The Session WebSocket */
	public connection: CloudWebsocket;

	/** Has the session sent the `connected` event yet */
	public sentConnected: boolean = false;

	/** The Session User */
	public user: User;
	/** The Session User Username */
	public username: string;
	/** The Session User ID */
	public id: number;
	/** The Project ID For The Session */
	public projectId: string;
	/** All Currently Cached Variables */
	public variables: Variable[] = [];

	/** The Session ID */
	private sessionId: string;

	/**
	 * A Cloud Session
	 * @param username The Username For The User
	 * @param password The Password For The User (NOT STORED)
	 * @param projectId The User Project ID
	 */
	constructor(username: string, password: string, projectId: string) {
		super();

		this.username = username;
		this.projectId = projectId;

		this._login(password);
	}

	private async _login(password: string) {
		const reqBody = JSON.stringify({
			username: this.username,
			password,
			useMessages: true
		});
		const { body, response } = await request({
			path: "/login/",
			method: "POST",
			body: reqBody,
			headers: { "X-Requested-With": "XMLHttpRequest" }
		});
		const user = JSON.parse(body)[0];
		if (user.msg) throw new Error(user.msg);
		this.user = user;
		this.username = this.user.username;
		this.id = this.user.id;
		this.sessionId = (parseCookie(response.headers["set-cookie"][0]) as any).scratchsessionsid;
		this._setup();
	}

	private _set(name: string, value: string): Variable {
		if (this.variables.find(i => i.name == name)) {
			this.variables.find(i => i.name == name)._set(value);
		} else {
			this.variables.push(new Variable(this, name, value));
		}
		return this.variables.find(i => i.name == name);
	}

	private _setup() {
		this.variables = [];
		this.connection = new CloudWebsocket(this.sessionId, this.username, this.projectId, "wss://clouddata.scratch.mit.edu");

		this.connection.on("connected", () => {
			if (!this.sentConnected) {
				this.emit("connected");
				this.sentConnected = true;
			}
		});
		this.connection.on("set", (name, value) => {
			this.emit("set", this._set(name, value));
			// @ts-expect-error
			this.emit(name, value);
		});
		this.connection.on("create", (name, value) => {
			const variable = this._set(name, value);
			this.emit("set", variable);
			// @ts-expect-error
			this.emit(variable.name, variable.value);
			this.emit("create", variable);
		});
		this.connection.on("delete", name => {
			const [variable] = this.variables.splice(this.variables.indexOf(this.variables.find(i => i.name == name)));
			this.emit("delete", variable);
		});
	}

	/**
	 * Get the currently cached version of a variable
	 * @param name The variable name
	 * @returns The found variable (`null` if none found)
	 */
	public get(name: string): Variable {
		return this.variables.find(i => i.name == name) || null;
	}

	/**
	 * Set a variable
	 * @param name The variable name
	 * @param value The variable value
	 * @returns The edited variable (after editing) (`null` if not existing)
	 */
	public set(name: string, value: string): Variable {
		if (!this.get(name)) return null;
		if (!value) value = "";
		this.connection._sendSet(name, value);
		return this._set(name, value);
	}

	/**
	 * Await the set of a variable
	 * @param name The variable name
	 * @returns The variable found
	 */
	public async awaitSet(name: string): Promise<Variable> {
		return (await once(this, name))[0];
	}
}
