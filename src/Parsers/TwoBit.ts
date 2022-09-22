// Characters The Parser Supports
export const keys = " abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()`~-_=+{[]}\\|/:;‘“’”'\"?,.<>";
// Same As The Keys, But Split Into An Array
export const keysList = keys.split("");

/**
 * Decode Data With A TwoBit Parser
 * @param {string} text The text to decode
 * @returns {string} The decoded data
 */
export function decode(text: string): string {
	let output = "";

	for (var index = 0; index < text.length; index += 2) {
		// Covers 2 Digits
		// "- 1" because scratch encoding will be 1 based, but js is 0 based
		output += keysList[parseInt(`${text.charAt(index)}${text.charAt(index + 1)}`) - 1];
	}

	return output;
}

/**
 * Encode Data With A TwoBit Parser
 * @param {string} text The text to encode
 * @returns {string[]} The encoded data, split into 256 character-long variables
 */
export function encode(text: any): string[] {
	if (!text) return [];
	if (typeof text == "object") text = JSON.stringify(text);
	if (typeof text != "string" && text.toString) text = text.toString();

	let variables: string[] = [];

	var index = 0;
	for (const textSet of text.match(/.{1,128}/g)) {
		variables[index] = "";
		for (const char of textSet.split("")) {
			let parsed: any = keysList.indexOf(char);
			if (parsed === -1) continue;
			// "+ 1" because scratch encoding will be 1 based, but js is 0 based
			parsed += 1;
			if (parsed < 10) {
				parsed = `0${parsed}`;
			} else {
				parsed = parsed.toString();
			}
			variables[index] += parsed;
		}
		index += 1;
	}

	return variables;
}
