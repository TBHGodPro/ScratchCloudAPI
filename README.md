# [Scratch Cloud API](https://github.com/TBHGodPro/ScratchCloudAPI)

### By: TBHGodPro

<br/><br/>

## What Is This

This is a package that gives you a reliable way to access the Scratch Cloud API, it can be used to change and recieve changes to any cloud variable in any project.

## Getting Started

To get started, run `npm install scratchcloudapi` in your terminal, and you're ready to go!

Here is an example of most things you'd need in this library:

```js
const API = require("scratchcloudapi");

// NOTE: Your passwords are never stored, you can look into the code for proof. We only use your password to login to scratch.
const cloud = new API.CloudSession("Username", "Password", "Project ID");

cloud.on("set", (name, value) => {
	cloud.set("Variable Name", "Variable Value");
	// Code Here
});

cloud.on("connected", () => {
	cloud.set("Variable Name", "Variable Value");
});

// NOTE: You can add a listener for a specific variable change by doing:

cloud.on("Variable Name", variableValue => {
	// Code Here
});
```

> NOTE: Other than adding listeners, you cannot do anything with the `cloud` object before the `connected` event

## Parsing

The library comes with built in data parsers, to view them, use the following:

```js
const API = require("scratchcloudapi");
const Parsers = API.Parsers;

// Example

const Parser = Parsers.TwoBit;
Parser.keys; // The keys for the TwoBit parsers
Parser.keysList; // Same as the keys, but split into an array
Parser.encode(); // Encode data
Parser.decode(); // Decode data
```

> NOTE: Not all Parsers have the same values when imported, except they all have `encode()` and `decode()`

To know more about the individual parsers, look below:

### TwoBit

<br/>

Converts every character into a data piece stored into two bits, allowing 128 characters per cloud variable.

Returns an array with all the variables that that text split into.

Characters:

(space)abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&\*()`~-\_=+{[]}\\|/:;‘“’”\'"?,.<>

<br/>

Example:

```ts
const { TwoBit } = require("scratchcloudapi").Parsers;

TwoBit.keys; // The keys for the parser
TwoBit.keysList; // Same as the keys, but split into an array
TwoBit.encode(normalText: string); // Encode data
TwoBit.decode(textContainingOnlyNumbers: string); // Decode data
```
