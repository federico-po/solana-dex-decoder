class Log {
  constructor(title = "", value = "") {
    this.title = title;
    this.value = value;
  }

  toString() {
    return `${this.title}: ${JSON.stringify(this.value)}`;
  }
}

class Logs {
  logs = [];

  add(title, value) {
    this.logs.push(new Log(title, value));
  }

  toString() {
    return this.logs.map((log) => log.toString()).join("\n");
  }
}

const createWithLog = () => {
  const logs = new Logs();

  const withLog = (name, result) => {
    logs.add(name, result);
    return result;
  };

  return { logs, withLog };
};

module.exports = createWithLog;
