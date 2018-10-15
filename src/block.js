const container = new Map();
const callbacks = new Map();

export default {
  isLocked: id => {
    const count = container.get(id) || 0;
    return count > 0;
  },
  lock: id => {
    let count = container.get(id) || 0;
    container.set(id, ++count);
  },
  release: function (id) {
    let count = container.get(id) || 0;
    if (count) {
      container.set(id, --count);
    }
    this.check();
  },
  check: () => {
    for (let [id, callback] of callbacks) {
      const count = container.get(id);
      if (count === 0) {
        container.delete(id);
        callback();
      }
    }
  },
  wait: function(id, callback) {
    callbacks.set(id, function() {
      callbacks.delete(id);
      callback();
    });
    this.check();
  }
};
