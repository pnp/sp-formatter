import { StatusBarAlignment, StatusBarItem, window } from 'vscode';

export class StatusBarManager {
  private static _statusBarItem: StatusBarItem;

  private static get statusbar() {
    if (!StatusBarManager._statusBarItem) {
      StatusBarManager._statusBarItem = window
        .createStatusBarItem(StatusBarAlignment.Right, 100);
        this.statusbar.show();
    }

    return StatusBarManager._statusBarItem;
  }

  static working(workingMsg = 'Working....') {
    this.statusbar.text = `$(pulse) ${workingMsg}`;
    this.statusbar.tooltip = 'In case if it takes long time, try to close all browser window.';
    this.statusbar.command = undefined;
}

  public static listening(fileName: string) {
    this.statusbar.text = '$(debug-disconnect) SP Formatter: listening';
    this.statusbar.command = 'sp-formatter.disconnect';
    this.statusbar.tooltip = `File name: ${fileName}.Click to stop listening`;
  }

  public static connected() {
    this.statusbar.text = '$(remote-explorer) SP Formatter: connected';
    this.statusbar.command = 'sp-formatter.disconnect';
    this.statusbar.tooltip = 'Click to disconnect';
  }

  public static destroy() {
    this.statusbar.dispose();
    StatusBarManager._statusBarItem = null;
  }
}