export default function sync(key, filter, block) {
  return {
    onEffect: function (effect, { put }, model, actionType) {
      const temp = [];
      return function* (...args) {
        if (filter(args[0])) {
          block.lock(key);
        }
        yield effect(...args);
        if (filter(args[0])) {
          block.release(key);
        }
      }
    }
  };
}
