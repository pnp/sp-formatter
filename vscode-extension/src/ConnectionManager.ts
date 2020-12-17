import { Disposable, TextDocument, window, workspace } from 'vscode';
import * as path from 'path';
import { createServer } from 'http';
import { Server as Socket } from 'socket.io';
import { StatusBarManager } from './StatusBarManager';
import stoppable, { StoppableServer } from 'stoppable';

const onGetFileName = 'vscode_get_file_name';
const onSendFileName = 'vscode_send_file_name';
const onSendFileContent = 'vscode_send_file_content';
const onReceivedFileContent = 'vscode_received_file_content';

export class ConnectionManager {
  private httpServer: StoppableServer;
  private port = '11232';
  private activeDocument: TextDocument;
  private connected = false;
  private activeSocket: Socket;
  private subscriptions: Disposable[] = [];

  public async start(): Promise<void> {
    StatusBarManager.working();
    if (this.httpServer) {
      await this.stop();
    }

    this.httpServer = stoppable(createServer(), 0);
    const io = new Socket(this.httpServer, {
      cors: {
        origin: '*'
      }
    });

    io.on('connection', (socket: Socket) => {
      StatusBarManager.connected();
      this.connected = true;
      this.activeSocket = socket;

      socket.on(onGetFileName, () => {
        io.emit(onSendFileName, this.getDocumentName());
      });

      socket.on('disconnect', () => {
        StatusBarManager.listening(this.getDocumentName());
      });
    });

    this.httpServer.listen(this.port);

    this.activeDocument = window.activeTextEditor.document;

    const onDidChange = workspace.onDidChangeTextDocument(e => {
      if (e.document.fileName !== this.activeDocument.fileName) {
        return;
      }

      this.subscriptions.push(onDidChange);
      //TODO add queue processing

      this.activeSocket.emit(onSendFileContent, { text: e.document.getText() });
    });

    StatusBarManager.listening(this.getDocumentName());
  }

  public async stop(): Promise<void> {
    if (!this.httpServer) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.httpServer.stop(e => {
        if (e) reject(e);

        this.connected = false;
        this.httpServer = null;
        for (const subscription of this.subscriptions) {
          subscription.dispose();
        }
        this.subscriptions = [];
        StatusBarManager.destroy();
        resolve();
      });
    })
  }

  private getDocumentName(): string {
    return path.basename(this.activeDocument.fileName);
  }
}