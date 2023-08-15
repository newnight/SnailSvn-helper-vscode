// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from "node:fs";
import * as child_process from "child_process";
 //import Blamer from "./blame";
const simpleActions = ["checkout", "cleanup", "commit", "export", "import", "log", "merge", "relocate", "revert", "switch", "update", "add-working-copy"];
const complexActions = ["add", "blame", "delete", "info", "ignore", "lock", "unlock"];
const allActions = simpleActions.concat(complexActions);
let snailSvnCmd = "";
if (fs.existsSync("/Applications/SnailSVN.app")) {
	snailSvnCmd = "snailsvn";
}else if (fs.existsSync("/Applications/SnailSVNLite.app")) {
	snailSvnCmd = "snailsvnfree";
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	if (snailSvnCmd === "") {
		vscode.window.showErrorMessage("You need to install 'SnailSVN' or 'SnailSVNLite' first!");
	} else {
		registerActions(allActions, context);
	}
}
function registerActions(allActions: string[], context:vscode.ExtensionContext) {
	allActions.forEach((action:string) => {
		context.subscriptions.push(vscode.commands.registerCommand(`newnight.snailsvn.${action}`, async (uri) => {
			let path ;
			if (uri && uri.fsPath) {
				path= uri.fsPath;
			}else if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document) {
				path= vscode.window.activeTextEditor.document.fileName;
			}else {
				path= vscode.workspace.workspaceFolders;
			}
			console.log(path);
			/* if (action.includes('blame')) {
				const blamer = new Blamer(path);
				blamer.showGutter();
			}else{
				await execSvnCmd(action,path);
			} */
			await execSvnCmd(action,path);
		}));
	});
}


async function execSvnCmd( action: string, path: string) {
	console.log('snail svn do command -> ' + `open ${snailSvnCmd}://svn-${action}${path}`);
	child_process.exec(`open ${snailSvnCmd}://svn-${action}${path}`, (exception, stdout, stderr) => {
		if (exception) {
			console.warn(`snail svn exception -> ${exception}`);
		}
		if (stdout) {
			console.log(`snail svn stdout -> ${stdout}`);
		}
		if (stderr) {
			console.error(`snail svn stderr -> ${stderr}`);
		}
	});
}
// This method is called when your extension is deactivated
export function deactivate() {}
