class Timer {
  constructor() {
    this.state = "initial"; // started, paused
    this.reference = 0;
    this.accumulated = 0;
    this.tickInterval = 50;
    this.tickCallback = null;
    this.tickUnsubscribe = null;
  }

  // hours, minutes, seconds, milliseconds
  get() {
    const t = this.accumulated / 1000; // seconds
    const ms = this.accumulated % 1000;
    const s = Math.floor(t % 60);
    const m = Math.floor((t / 60) % 60);
    const h = Math.floor((t / 60 / 60) % 100);
    return [h, m, s, ms];
  }

  getFormat() {
    let [h, m, s, ms] = this.get();
    [h, m, s] = [h, m, s].map((x) => String(x).padStart(2, "0"));
    ms = Math.floor(ms / 100);
    return `${h}:${m}:${s}.${ms}`;
  }

  tick() {
    const next = performance.now();
    this.accumulated += next - this.reference;
    this.reference = next;
    if (this.tickCallback) {
      this.tickCallback();
    }
  }

  startTick() {
    this.tick();
    this.tickUnsubscribe = setInterval(() => this.tick(), this.tickInterval);
  }

  stopTick() {
    this.tick();
    clearInterval(this.tickUnsubscribe);
  }

  start() {
    this.state = "started";
    this.reference = performance.now();
    this.accumulated = 0;
    this.startTick();
  }

  pause() {
    this.stopTick();
    this.state = "paused";
  }

  resume() {
    this.state = "started";
    this.reference = performance.now();
    this.startTick();
  }

  reset() {
    if (this.state === "started") {
      this.stopTick();
    }
    this.state = "initial";
    this.accumulated = 0;
  }
}

const App = () => {
  const timer = new Timer();
  timer.tickCallback = () => {
    m.redraw();
    setTitle();
  };

  const setTitle = () => {
    document.title = timer.getFormat().split(".")[0];
  };

  const oncreate = () => {
    document.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        timer.reset();
        timer.start();
      }
    });
  };

  const viewButton = (name) => {
    return m(
      ".button",
      {
        onclick: () => {
          timer[name]();
          setTitle();
        },
      },
      name
    );
  };

  const view = () => {
    const buttonL =
      timer.state === "initial"
        ? viewButton("start")
        : timer.state === "started"
        ? viewButton("pause")
        : viewButton("resume");
    const buttonR = viewButton("reset");
    return m("main", [
      m(".time", timer.getFormat()),
      m(".buttons", [buttonL, buttonR]),
    ]);
  };

  return { oncreate, view };
};

const main = () => {
  m.mount(document.querySelector("#root"), App);
};

main();
