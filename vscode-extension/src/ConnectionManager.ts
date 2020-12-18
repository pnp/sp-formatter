import { Disposable, TextDocument, window, workspace } from 'vscode';
import * as path from 'path';
import { createServer } from 'http';
import { Server as Socket } from 'socket.io';
import { StatusBarUtil } from './utils/StatusBarUtil';
import stoppable, { StoppableServer } from 'stoppable';

const onGetFileName = 'vscode_get_file_name';
const onSendFileName = 'vscode_send_file_name';
const onSendFileContent = 'vscode_send_file_content';
const onInitFileContent = 'vscode_init_file_content';

export class ConnectionManager {
  private httpServer: StoppableServer;
  private port = '11232';
  private activeDocument: TextDocument;
  private activeSocket: Socket;
  private subscriptions: Disposable[] = [];

  public async start(): Promise<void> {
    StatusBarUtil.working();
    if (this.httpServer) {
      await this.stop();
    }

    this.activeDocument = window.activeTextEditor.document;

    this.httpServer = stoppable(createServer(), 0);
    const io = new Socket(this.httpServer, {
      cors: {
        origin: '*'
      }
    });

    io.on('connection', (socket: Socket) => {
      StatusBarUtil.connected(this.getDocumentName());
      this.activeSocket = socket;

      socket.on(onGetFileName, () => {
        io.emit(onSendFileName, this.getDocumentName());
      });

      socket.once(onInitFileContent, () => {
        io.emit(onSendFileContent, this.getDocumentName());
      });

      socket.on('disconnect', () => {
        StatusBarUtil.listening(this.getDocumentName());
      });
    });

    this.httpServer.listen(this.port);

    const onDidChange = workspace.onDidChangeTextDocument(e => {
      if (e.document.fileName !== this.activeDocument.fileName) {
        return;
      }

      this.activeSocket.emit(onSendFileContent, { text: e.document.getText() });
    });

    this.subscriptions.push(onDidChange);

    StatusBarUtil.listening(this.getDocumentName());
  }

  public async stop(): Promise<void> {
    if (!this.httpServer) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.httpServer.stop(e => {
        if (e) {
          reject(e);
          return;
        }

        this.httpServer = null;
        for (const subscription of this.subscriptions) {
          subscription.dispose();
        }
        this.subscriptions = [];
        StatusBarUtil.destroy();
        resolve();
      });
    })
  }

  private getDocumentName(): string {
    return path.basename(this.activeDocument.fileName);
  }
}