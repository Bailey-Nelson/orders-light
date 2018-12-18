const Blink1 = require('node-blink1');
const ngrok = require('ngrok');
const authtoken = '6Vcg38cCn34fo9T1maWYj_6nuWaLy45rLQrjsnKNdvb';
const PORT = 3567;

function setColor(blink, [r, g, b], duration = 1000, fadeMillis = 0) {
  return new Promise(resolve => {
    if (fadeMillis > 0) {
      blink.fadeToRGB(fadeMillis, r, g, b);
      setTimeout(async () => {
        await stop(blink);
        resolve();
      }, duration);
    } else {
      blink.setRGB(r, g, b);
      setTimeout(async () => {
        await stop(blink);
        resolve();
      }, duration);
    }
  });
}

function stop(blink) {
  return new Promise(resolve => {
    blink.off(resolve);
  });
}

async function flashGreen(light) {
  for (let i = 0; i < 10; i++) {
    await setColor(light, [0, 255, 0], 200);
    await setColor(light, [0, 0, 0], 200);
  }
}

async function flashRed(light) {
  for (let i = 0; i < 10; i++) {
    await setColor(light, [255, 0, 0], 200);
    await setColor(light, [0, 0, 0], 200);
  }
}

const http = require('http');
const light = new Blink1();

ngrok.connect({
  authtoken,
  addr: PORT,
  subdomain: 'orderslight',
  region: 'us',
});

http
  .createServer(async (req, res) => {
    console.log('event');
    res.end();
    const url = req.url;
    if (url === '/order_created') {
      await flashGreen(light);
    } else if (url === '/order_returned' || url === '/order_cancelled') {
      await flashRed(light);
    }
  })
  .listen(PORT, async function() {
    console.log('start');
    await setColor(light, [0, 0, 255], 1000);
  });
