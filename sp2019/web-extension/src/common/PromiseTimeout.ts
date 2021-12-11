import { Logger } from './Logger'

export function promiseTimeout(miliSeconds, promise, message): Promise<any> {

  return new Promise((resolve, reject) => {

    // create a timeout to reject promise if not resolved
    const timer = setTimeout(() => {
      reject(new Error(message + ' timed out'));
    }, miliSeconds);

    promise
      .then((res) => {
        Logger.log(message + ' resolved');
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        Logger.log(message + ' errored');
        clearTimeout(timer);
        reject(err);
      });
  });
}
