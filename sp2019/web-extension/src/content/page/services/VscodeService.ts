import { io, Socket } from 'socket.io-client';
import { IEnabled } from '../../../common/data/IEnabled';
import { IFileContent } from '../../../common/data/IFileContent';
import { Content } from '../../../common/events/Events';
import { WebEventEmitter } from '../../../common/events/WebEventEmitter';
import { promiseTimeout } from '../../../common/PromiseTimeout';
import { getListFields } from './SPService';

const port = 11232;
const messagingTimeout = 2000;

export class VscodeService {
  private pagePipe: WebEventEmitter;
  private socket: Socket;
  private static _instance: VscodeService;

  public static get instance(): VscodeService {
    if (!this._instance) {
      this._instance = new VscodeService();
    }

    return this._instance;
  }

  private constructor() {
    this.pagePipe = WebEventEmitter.instance;
  }

  public async connect() {
    this.socket = io(`http://localhost:${port}/`, {
      reconnectionAttempts: 3,
      autoConnect: false
    });

    this.socket.on('connect', () => {
      this.pagePipe.emit<IEnabled>(Content.Vscode.onConnected, { enabled: true });
      this.socket.emit(Content.Vscode.onInitFileContent);
    });

    this.socket.on('disconnect', () => {
      this.pagePipe.emit<IEnabled>(Content.Vscode.onConnected, { enabled: false });
    });

    this.socket.on(Content.Vscode.onSendFileContent, (data: IFileContent) => {
      this.pagePipe.emit<IFileContent>(Content.Vscode.onSendFileContent, data);
    });

    this.socket.on(Content.Vscode.onGetListFields, async () => {
      const fields = await getListFields();
      this.socket.emit(Content.Vscode.onSendListFields, fields);
    });

    this.socket.connect();
  }

  public async disconnect() {
    this.socket.disconnect();
  }

  public async getConnectedFileName(): Promise<string> {
    const promise = new Promise<string>((resolve) => {
      this.socket.once(Content.Vscode.onSendFileName, ((name: string) => {
        resolve(name);
      }));

      this.socket.emit(Content.Vscode.onGetFileName);
    });

    return promiseTimeout(messagingTimeout, promise, 'getConnectedFileName');
  }

}
