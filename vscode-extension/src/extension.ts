import * as vscode from 'vscode';
import { ConnectionManager } from './ConnectionManager';

let connectionManager: ConnectionManager;

export function activate(context: vscode.ExtensionContext) {
  connectionManager = new ConnectionManager();

  const connect = vscode.commands.registerCommand('sp-formatter.connect', async () => {
    await connectionManager.start();
  });

  const disconnect = vscode.commands.registerCommand('sp-formatter.disconnect', async () => {
    await connectionManager.stop();
  });

  context.subscriptions.push(connect);
  context.subscriptions.push(disconnect);
}

export function deactivate() {
  //
}
