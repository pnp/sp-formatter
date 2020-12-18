import { StatusBarAlignment, StatusBarItem, window } from 'vscode';

export class StatusBarUtil {
  private static _statusBarItem: StatusBarItem;

  private static get statusbar() {
    if (!StatusBarUtil._statusBarItem) {
      StatusBarUtil._statusBarItem = window
        .createStatusBarItem(StatusBarAlignment.Right, 100);
      this.statusbar.show();
    }

    return StatusBarUtil._statusBarItem;
  }

  public static working(workingMsg = 'Working....') {
    this.statusbar.text = `$(pulse) ${workingMsg}`;
    this.statusbar.tooltip = 'In case if it takes long time, try to close all browser window.';
    this.statusbar.command = undefined;
  }

  public static listening(fileName: string) {
    this.statusbar.text = '$(debug-disconnect) SP Formatter: listening';
    this.statusbar.command = 'sp-formatter.disconnect';
    this.statusbar.tooltip = `File name: ${fileName}. Click to stop listening`;
  }

  public static connected(fileName: string) {
    this.statusbar.text = '$(remote-explorer) SP Formatter: connected';
    this.statusbar.command = 'sp-formatter.disconnect';
    this.statusbar.tooltip = `File name: ${fileName}. Click to disconnect`;
  }

  public static destroy() {
    this.statusbar.dispose();
    StatusBarUtil._statusBarItem = null;
  }
}