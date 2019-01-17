const Blink1 = require('node-blink1');
const defaultColor = [255, 255, 255];

module.exports = class LightControl {
  constructor() {
    this.light = new Blink1();
  }

  _setColor([r, g, b] = defaultColor, duration = 1000, fadeMillis = 0) {
    return new Promise(resolve => {
      if (fadeMillis > 0) {
        this.light.fadeToRGB(fadeMillis, r, g, b);
        setTimeout(async () => {
          await this._stop(blink);
          resolve();
        }, duration);
      } else {
        this.light.setRGB(r, g, b);
        setTimeout(async () => {
          await this._stop();
          resolve();
        }, duration);
      }
    });
  }

  _stop() {
    return new Promise(resolve => {
      this.light.off(resolve);
    });
  }

  async flash(color = defaultColor) {
    for (let i = 0; i < 5; i++) {
      await this._setColor(color, 200);
      await this._setColor([0, 0, 0], 200);
    }
  }
};
