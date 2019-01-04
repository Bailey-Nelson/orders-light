const express = require('express');
const cors = require('cors');
const ngrok = require('ngrok');
const authtoken = '';
const PORT = 3567;
const LightControl = require('./LightControl');
const light = new LightControl();
const notifier = require('node-notifier');

ngrok.connect({
  authtoken,
  addr: PORT,
  subdomain: 'orderslight',
  region: 'us',
});

const app = express();
const router = express.Router();
app.use(express.json());
app.use(cors({ credentials: true, origin: true }));
app.use(filterDuplicates);
app.options('*', cors());

router.post('/order_created', orderCreated);
router.post('/order_cancelled', orderCancelled);
app.use('/', router);

app.listen(PORT, async () => {
  console.log('start');
  await light._setColor([0, 0, 255], 1000);
});

const uniqueHashes = new Set();

function filterDuplicates(req, res, next) {
  const hash = req.headers['x-shopify-hmac-sha256'];
  const test = req.headers['x-shopify-test'];

  if (!test && uniqueHashes.has(hash)) {
    console.log('duplicate');
    res.sendStatus(200);
  } else {
    uniqueHashes.add(hash);
    next();
  }
}

async function orderCreated(req, res) {
  const { total_price, total_discounts, created_at } = req.body;
  const products = req.body.line_items.map(x => x.title || x.name).join(', ');
  const store = req.headers['x-shopify-shop-domain'].split('.')[0];

  // Send response
  res.sendStatus(200);

  // Log event
  console.log(
    'Order Created:',
    created_at,
    store,
    total_price,
    total_discounts,
    products,
  );

  // Show desktop notification
  notifier.notify({
    title: `Order Completed: ${store}`,
    message: `${total_price}, ${total_discounts}, ${products}`,
  });

  // Flash light
  const color = store === 'bncanada' ? [0, 255, 0] : [0, 0, 255];
  light.flash(color);
}

async function orderCancelled(req, res) {
  const { updated_at } = req.body;
  const store = req.headers['x-shopify-shop-domain'];

  console.log('Order Cancelled:', updated_at, store.split('.')[0]);
  await light.flash([255, 0, 0]);
  res.sendStatus(200);
}
