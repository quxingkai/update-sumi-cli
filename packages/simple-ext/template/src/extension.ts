// vscode namespace 下为 VS Code 插件 API
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("HelloOpenSumi", async () => {
      vscode.window.showInformationMessage('Hello OpenSumi');
    })
  );
}

export function deactivate() {}
