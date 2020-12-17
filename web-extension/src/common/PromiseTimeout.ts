export function promiseTimeout(ms, promise): Promise<any> {

    return new Promise((resolve, reject) => {

      // create a timeout to reject promise if not resolved
      const timer = setTimeout(() => {
          reject(new Error('promise timeout'));
      }, ms);

      promise
          .then((res) => {
              clearTimeout(timer);
              resolve(res);
          })
          .catch((err) => {
              clearTimeout(timer);
              reject(err);
          });
    });
  }
