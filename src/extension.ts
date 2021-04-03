// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {
	commands,
	ExtensionContext,
} from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext): void {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "GoNavBar" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const goForward = commands.registerCommand('GoNavBar.goForward', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		void commands.executeCommand('workbench.action.navigateForward');
	});

	const goBack = commands.registerCommand('GoNavBar.goBack', () => {
		void commands.executeCommand('workbench.action.navigateBack');
	});

	const goLastEditLocation = commands.registerCommand('GoNavBar.goLastEditLocation', () => {
		void commands.executeCommand('workbench.action.navigateToLastEditLocation');
	});

	const goToBracket = commands.registerCommand('GoNavBar.goToBracket', () => {
		void commands.executeCommand('editor.action.jumpToBracket');
	});

	const saveWithoutFormat = commands.registerCommand('GoNavBar.saveWithoutFormatting', () => {
		void commands.executeCommand('workbench.action.files.saveWithoutFormatting');
	});

	context.subscriptions.push(goForward, goBack, goLastEditLocation, goToBracket, saveWithoutFormat);
}

// this method is called when your extension is deactivated
export function deactivate(): void {
	// placeholder
}
