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

cloud.set("Variable Name", "Variable Value");

cloud.on("set", (name, value) => {
	// Code Here
});
```
