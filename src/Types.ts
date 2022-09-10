export type Events = {
	connected: () => void;
	set: (name: string, value: string) => void;
	close: (code: number, reason?: any) => void;
};

export interface User {
	username: string;
	token: string;
	id: number;
}

export interface Variable {
	name: string;
	value: string;
}
