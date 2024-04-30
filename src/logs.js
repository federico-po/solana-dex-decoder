class Log {
  constructor(title = "", value = "") {
    this.title = title;
    this.value = value;
  }

  toString() {
    return `${this.title}: ${JSON.stringify(this.value)}`;
  }
}

export class Logs {
  logs = [];

  add(title, value) {
    this.logs.push(new Log(title, value));
  }

  toString() {
    return this.logs.map((log) => log.toString()).join("\n");
  }
}
