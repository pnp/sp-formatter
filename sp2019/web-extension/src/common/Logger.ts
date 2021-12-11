export class Logger {
  public static log(info: string): void {
    if (process.env.NODE_ENV === 'development') {

      const src = (document.currentScript as HTMLScriptElement).src;
      const page = src.substring(src.lastIndexOf('/') + 1);
      console.log(`[${page}]: ${info}`);
    }
  }
}
