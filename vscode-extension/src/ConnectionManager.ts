import { Disposable, TextDocument, window, workspace } from 'vscode';
import * as path from 'path';
import { createServer, Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { StatusBarUtil } from './utils/StatusBarUtil';
import { ContextCompletionProvider } from './utils/ContextCompletionProvider';
import { Field } from './data/Field';
import { promiseTimeout } from './utils/PromiseTimeout';
import getPort from 'get-port';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const killPort = require('kill-port');
import { Logger } from './utils/Logger';

const onGetFileName = 'vscode_get_file_name';
const onSendFileName = 'vscode_send_file_name';
const onSendFileContent = 'vscode_send_file_content';
const onInitFileContent = 'vscode_init_file_content';
const onGetListFields = 'vscode_get_list_fields';
const onSendListFields = 'vscode_send_list_fields';

export class ConnectionManager {
  private httpServer: HttpServer;
  private ioServer: SocketServer;
  private port = 11232;
  private defaultTimeOut = 2000;
  private activeDocument: TextDocument;
  private activeSocket: any;
  private subscriptions: Disposable[] = [];
  private providers: Disposable[] = [];

  public async listen(): Promise<void> {
    StatusBarUtil.working();
    if (this.httpServer) {
      await this.stop();
    }

    await this.freePortIfInUse();

    this.activeDocument = window.activeTextEditor.document;

    this.httpServer = createServer();
    this.ioServer = new SocketServer(this.httpServer, {
      cors: {
        origin: '*'
      }
    });
    const io = this.ioServer;

    io.on('connection', (socket) => {
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

    await this.closeSocketServer();
    await this.closeHttpServer();

    this.httpServer = null;
    this.ioServer = null;
    this.disposeObjects();
    this.subscriptions = [];
    this.activeSocket = null;

    StatusBarUtil.destroy();
  }

  private closeSocketServer(): Promise<void> {
    if (!this.ioServer) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.ioServer.close(() => {
        resolve();
      });
    });
  }

  private closeHttpServer(): Promise<void> {
    if (!this.httpServer) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.httpServer.close((e) => {
        const error = e as NodeJS.ErrnoException;

        if (error && error.code !== 'ERR_SERVER_NOT_RUNNING') {
          reject(e);
          return;
        }

        resolve();
      });
    });
  }

  private async freePortIfInUse() {
    const freePort = await getPort({ port: this.port, host: 'localhost' });

    // the needed port is not free
    if (freePort !== this.port) {

      Logger.log(`The port ${this.port} is in use. Trying to release...`);

      await killPort(this.port);

      Logger.log(`The port ${this.port} is successfully released.`);
    }
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
