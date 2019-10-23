// vscode namespace 下为 VS Code 插件 API
import * as vscode from "vscode";

// kaitian 自有插件 API
import * as kaitian from "kaitian";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("HelloKaitian", async () => {
      const result = await vscode.window.showQuickPick(["reload", "cancel"]);
      if (result === "reload") {
        kaitian.ideWindow.reloadWindow();
      }
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
