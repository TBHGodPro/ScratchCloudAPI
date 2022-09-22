import https from "https";
import { IncomingMessage } from "http";

/**
 * Parse a cookie from the Scratch API
 * @param cookie The cookie
 * @returns The parsed cookie, mapped in a `key:value` format
 */
export function parseCookie(cookie: string): { [key: string]: any } {
	let cookies = {};
	const each = cookie.split(";");
	let i = each.length;
	while (i--) {
		if (each[i].indexOf("=") === -1) {
			continue;
		}
		const pair = each[i].split("=");
		cookies[pair[0].trim()] = pair[1].trim();
	}
	return cookies;
}

/**
 * Send a request to the Scratch API
 * @param options The request options
 * @returns The data from the request
 */
export function request(options: { path: string; method: string; body?: any; headers?: { [key: string]: any }; sessionId?: string; hostname?: string }): Promise<{
	body: any;
	response: IncomingMessage;
}> {
	return new Promise(res => {
		let headers = {
			Cookie: "scratchcsrftoken=a; scratchlanguage=en;",
			"X-CSRFToken": "a",
			referer: "https://scratch.mit.edu" // Required by Scratch servers
		};
		if (options.headers) {
			for (const name in options.headers) {
				headers[name] = options.headers[name];
			}
		}
		if (options.body) headers["Content-Length"] = Buffer.byteLength(options.body);
		if (options.sessionId) headers.Cookie += "scratchsessionsid=" + options.sessionId + ";";
		const req = https.request(
			{
				hostname: options.hostname || "scratch.mit.edu",
				port: 443,
				path: options.path,
				method: options.method || "GET",
				headers: headers
			},
			function (response) {
				let parts = [];
				response.on("data", function (chunk) {
					parts.push(chunk);
				});
				response.on("end", function () {
					res({
						body: Buffer.concat(parts).toString(),
						response
					});
				});
			}
		);
		req.on("error", err => {
			throw err;
		});
		if (options.body) req.write(options.body);
		req.end();
	});
}
