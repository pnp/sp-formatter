import { Disposable, TextDocument, window, workspace } from 'vscode';
import * as path from 'path';
import { createServer } from 'http';
import { Server as Socket } from 'socket.io';
import { StatusBarUtil } from './utils/StatusBarUtil';
import stoppable, { StoppableServer } from 'stoppable';
import { ContextCompletionProvider } from './utils/ContextCompletionProvider';
import { Field } from './data/Field';
import { promiseTimeout } from './utils/PromiseTimeout';

const onGetFileName = 'vscode_get_file_name';
const onSendFileName = 'vscode_send_file_name';
const onSendFileContent = 'vscode_send_file_content';
const onInitFileContent = 'vscode_init_file_content';
const onGetListFields = 'vscode_get_list_fields';
const onSendListFields = 'vscode_send_list_fields';

export class ConnectionManager {
  private httpServer: StoppableServer;
  private port = 11232;
  private defaultTimeOut = 2000;
  private activeDocument: TextDocument;
  private activeSocket: Socket;
  private subscriptions: Disposable[] = [];
  private providers: Disposable[] = [];

  public async listen(): Promise<void> {
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
      StatusBarUtil.connected(this.documentName);
      this.activeSocket = socket;

      socket.on(onGetFileName, () => {
        io.emit(onSendFileName, this.documentName);
      });

      socket.once(onInitFileContent, () => {
        io.emit(onSendFileContent, { text: this.activeDocument.getText() });
      });

      socket.on('disconnect', () => {
        StatusBarUtil.listening(this.documentName);
      });

      this.initCompletionProvider();
    });

    this.httpServer.listen(this.port);

    const onDidChange = workspace.onDidChangeTextDocument(e => {
      if (e.document.fileName !== this.activeDocument.fileName) {
        return;
      }

      this.activeSocket.emit(onSendFileContent, { text: e.document.getText() });
    });

    this.subscriptions.push(onDidChange);

    StatusBarUtil.listening(this.documentName);
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
        this.disposeObjects();
        this.subscriptions = [];

        StatusBarUtil.destroy();
        resolve();
      });
    })
  }

  private async initCompletionProvider() {
    for (const provider of this.providers) {
      provider.dispose();
    }

    const fields = await this.getListFields();

    const completionProvider = ContextCompletionProvider.register(this.documentName, fields);

    this.providers.push(completionProvider);
  }

  private disposeObjects() {
    for (const subscription of this.subscriptions) {
      subscription.dispose();
    }

    for (const provider of this.providers) {
      provider.dispose();
    }
  }

  private async getListFields(): Promise<Field[]> {
    const promise = new Promise<Field[]>((resolve) => {
      this.activeSocket.once(onSendListFields, ((fields: Field[]) => {
        resolve(fields);
      }));

      this.activeSocket.emit(onGetListFields);
    });

    return promiseTimeout(this.defaultTimeOut, promise, 'getListFields');
  }

  private get documentName(): string {
    return path.basename(this.activeDocument.fileName);
  }
}
