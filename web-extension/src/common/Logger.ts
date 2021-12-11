export class Logger {
  public static log(info: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      const now = new Date();
      console.log(`[${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}] [${this.getScriptName()}]: ${info}`);
      if (data) {
        console.log(data);
      }
    }
  }

  private static getScriptName() {
    const error = new Error();
    let source: any;
    const lastStackFrameRegex = new RegExp(/.+\/(.*?):\d+(:\d+)*$/)
    const currentStackFrameRegex = new RegExp(/getScriptName \(.+\/(.*):\d+:\d+\)/);

    if ((source = lastStackFrameRegex.exec(error.stack.trim())) && source[1] != '')
      return source[1];
    else if ((source = currentStackFrameRegex.exec(error.stack.trim())))
      return source[1];
    else if ((error as any).fileName)
      return (error as any).fileName;
  }
}
