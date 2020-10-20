function memoryUsage() {
  return `(RSS: ${(process.memoryUsage().rss / 1024 / 1024 / 1024).toFixed(
    3
  )} GiB)`;
}

class Timer {
  static start() {
    this.time = new Date();
  }
  static stop() {
    return new Date() - this.time;
  }
}

module.exports = {
  memoryUsage,
  Timer,
};
