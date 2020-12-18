export class Logger {
  public static log(info: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(info);
    }
  }
}
