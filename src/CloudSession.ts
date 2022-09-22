import { EventEmitter, once } from "node:events";
import TypedEmitter from "./TypedEmitter";
import { Events, User } from "./Types";
import Variable from "./Variable";
import { request, parseCookie } from "./utils";
import CloudWebsocket from "./CloudWebsocket";

/** A Cloud Session */
export default class CloudSession extends (EventEmitter as new () => TypedEmitter<Events>) {
	/** The Session WebSocket */
	public connection: CloudWebsocket;

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
		password = null;
	}

	private async _login(password: string) {
		const reqBody = JSON.stringify({
			username: this.username,
			password
		});
		password = null;
		// @ts-ignore
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
		this.sessionId = (
			parseCookie(response.headers["set-cookie"][0]) as {
				scratchsessionsid: string;
			}
		).scratchsessionsid;
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

		this.connection.on("connected", this.emit);
		this.connection.on("set", (name, value) => {
			this.emit("set", this._set(name, value));
			// @ts-expect-error
			this.emit(name, value);
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
