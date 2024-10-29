// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from "node:fs";
import * as child_process from "child_process";
import * as _path from "path";
registerLocalize();
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
	context.subscriptions.push(vscode.commands.registerCommand(`newnight.snailsvn.resetLocalize`, async () => {
		registerLocalize();
	}));
}
export function onDidChangeConfiguration() {
	console.log('change configuare');
	registerLocalize();
}
function registerLocalize(){
	const locale = vscode.env.language;
	const  {localizeSetting} = vscode.workspace.getConfiguration("SnailSvn");
	const extensionPath = vscode.extensions.getExtension("newnight.snailsvn")?.extensionPath || '';
	const localizeTemplatePath = _path.join(extensionPath, "l10n", "bundle.l10n.json");
	const nlsPath = _path.join(extensionPath, "package.nls."+locale+".json");
	if (!fs.existsSync(localizeTemplatePath)) {
		return;
	}
	const bundle = JSON.parse(fs.readFileSync(localizeTemplatePath).toString());
	let changed = true;
	for (const key in bundle) {
		if (localizeSetting.hasOwnProperty(key) && localizeSetting[key]) {
			bundle[key] = localizeSetting[key];
		}
		changed = changed && bundle[key] !== localizeSetting[key];
	}
	if(changed || !fs.existsSync(nlsPath)) {
		fs.writeFileSync(nlsPath, JSON.stringify(bundle, null, 4));
	}
}
function registerActions(allActions: string[], context:vscode.ExtensionContext) {
	const { realPath } = vscode.workspace.getConfiguration("SnailSvn");
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
			if (realPath){
				path = fs.realpathSync(path);
			}
			console.log(path);
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
