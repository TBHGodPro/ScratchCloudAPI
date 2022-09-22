import CloudSession from "./CloudSession";

/** A Cloud Variable */
export default class Variable {
	/** The session that the variable is linked to */
	public session: CloudSession;

	/* The Variable Name */
	public name: string;
	/* The Currently Stored Variable Value */
	public value: string;

	/**
	 * A Cloud Variable
	 * @param session The Cloud Session
	 * @param name The Name For The Variable
	 * @optional @param value The Currently Stored Value For The Variable
	 */
	constructor(session: CloudSession, name: string, value?: string) {
		this.session = session;
		this.name = name;
		this.value = value || "";
	}

	/**
	 * Set the variable (WARNING: THIS METHOD ONLY SETS THE VARIABLE LOCALLY AND DOES NOT SET THE VARIABLE OVER THE CLOUD)
	 * @param {string} value The value to set
	 * @returns {string} The value that was set (ONLY LOCALLY)
	 */
	public _set(value: string): string {
		if (typeof value != "string") value = "";
		this.value = value || "";
		return value || "";
	}

	/**
	 * Set the variable
	 * @param {string} value The (Scratch Encoded) Data To Set
	 * @returns {string} The value that was set
	 */
	public set(value: string): string {
		if (typeof value != "string") value = "";
		this.session.set(this.name, value || "");
		return value || "";
	}
}
