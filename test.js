const notifier = require('node-notifier');
const express = require('express');
const app = express();
app.use('/', test);

app.listen(9000);

async function test(req, res) {
  console.log('request');
  res.sendStatus(200);
  console.log('response');
  notifier.notify({
    title: 'Order Completed',
    message: `bncanada, 225.00, Theodore clip prescriptions lenses`,
  });
  console.log('notify');

  console.log('before wait');
  wait(4000);
}

function wait(ms = 1000) {
  return new Promise(resolve => {
    console.log('in wait');
    setTimeout(() => {
      console.log('after wait');
      resolve();
    }, ms);
  });
}
