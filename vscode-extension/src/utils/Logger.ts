import { OutputChannel, window } from 'vscode';
import { ExtensionName } from '../Consts';

export class Logger {

  private static outputChannel: OutputChannel;

  private static get channel() {
    if (!this.outputChannel) {
      this.outputChannel = window.createOutputChannel(ExtensionName);
    }

    return this.outputChannel;
  }

  private constructor() {
    //
  }

  public static log(message: string) {
    this.format(message);
  }

  public static error(message: string | Error | any, stackTrace?: string, details?: string) {

    this.format('****** ERROR *****');
    
    if (message instanceof Error) {
      this.format(`Message: ${message.message}`);
    } else if (typeof (message) === 'string') {
      this.format(`Message: ${message}`);
    } else {
      this.format(`Message: ${message.toString()}`);
    }

    if (message instanceof Error) {
      this.format(`Stack trace: ${message.stack}`);
    } else {
      if (stackTrace) {
        this.format(`Stack trace: ${stackTrace}`);
      }

      if (details) {
        this.format(`Details: ${details}`)
      }
    }

    this.format('******');
  }

  public static format(message: string) {
    this.channel.appendLine(`[${new Date().toLocaleString()}] ${message}`);
  }
}