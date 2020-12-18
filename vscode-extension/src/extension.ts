import * as vscode from 'vscode';
import { window } from 'vscode';
import { ConnectionManager } from './ConnectionManager';
import { Logger } from './utils/Logger';

let connectionManager: ConnectionManager;

export function activate(context: vscode.ExtensionContext) {
  connectionManager = new ConnectionManager();

  const connect = vscode.commands.registerCommand('sp-formatter.connect', async () => {
    try {
      await connectionManager.listen();
    }
    catch (e) {
      Logger.error(e);
      window.showErrorMessage('Error: ' + e?.message || e.toString());
      throw e;
    }
  });

  const disconnect = vscode.commands.registerCommand('sp-formatter.disconnect', async () => {
    try {
      await connectionManager.stop();
    }
    catch (e) {
      Logger.error(e);
      window.showErrorMessage('Error: ' + e?.message || e.toString());
      throw e;
    }
  });

  context.subscriptions.push(connect);
  context.subscriptions.push(disconnect);
}

export function deactivate() {
  //
}
