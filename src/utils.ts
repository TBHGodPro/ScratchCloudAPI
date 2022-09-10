import dirFetch, { RequestInfo, RequestInit } from "node-fetch";
import https from "https";
import { IncomingMessage } from "http";

export const SERVER = "https://scratch.mit.edu";
export const API_SERVER = "https://api.scratch.mit.edu";

export { dirFetch, RequestInfo, RequestInit };

export async function fetch(url: RequestInfo, init?: RequestInit): Promise<any> {
	return dirFetch(url, init)
		.then(res => res.text())
		.then(data => {
			let returnData: any;

			try {
				returnData = JSON.parse(data);
			} catch {
				returnData = data;
			}

			return returnData;
		});
}

export function parseCookie(cookie: string) {
	var cookies = {};
	var each = cookie.split(";");
	var i = each.length;
	while (i--) {
		if (each[i].indexOf("=") === -1) {
			continue;
		}
		var pair = each[i].split("=");
		cookies[pair[0].trim()] = pair[1].trim();
	}
	return cookies;
}

export function request(options: any): Promise<{
	body: any;
	response: IncomingMessage;
}> {
	return new Promise(res => {
		var headers = {
			Cookie: "scratchcsrftoken=a; scratchlanguage=en;",
			"X-CSRFToken": "a",
			referer: SERVER // Required by Scratch servers
		};
		if (options.headers) {
			for (var name in options.headers) {
				headers[name] = options.headers[name];
			}
		}
		if (options.body) headers["Content-Length"] = Buffer.byteLength(options.body);
		if (options.sessionId) headers.Cookie += "scratchsessionsid=" + options.sessionId + ";";
		var req = https.request(
			{
				hostname: options.hostname || "scratch.mit.edu",
				port: 443,
				path: options.path,
				method: options.method || "GET",
				headers: headers
			},
			function (response) {
				var parts = [];
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
