module.exports = function parallelRunPromise(lazyPromises, n) {
  const results = [];
  let index = 0;
  let working = 0;
  let complete = 0;

  const addWorking = (res, rej) => {
    while (working < n && index < lazyPromises.length) {
      const current = lazyPromises[index++];
      working++;
      // eslint-disable-next-line
      ((i) => {
        current().then(result => {
          working--;
          complete++;
          results[i] = result;

          if (complete === lazyPromises.length) {
            res(results);
            return;
          }
          addWorking(res, rej);
        }, rej);
      })(index - 1);
    }
  };

  return new Promise(addWorking);
};

