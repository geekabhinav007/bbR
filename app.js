const dotenv = require("dotenv")
dotenv.config();
const express = require("express");

const app = express();
const admin = require('firebase-admin');
const port = process.env.PORT || 3000;


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});


admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CONFIG)),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});


let db = admin.firestore();



// middlewares
app.use(express.json({ extended: false }));

app.use("/payment", require("./payment"));


// Add a new item to the cart with the given ID because you are having uid also so only show cart items of that user whose uid matches
app.get('/', (req, res) => {
  res.send('Hello World!');
});


app.post('/cart/add', async (req, res) => {
  const item = req.body;
  const userId = req.body.uid;
  const docRef = db.collection(`cartItems_${userId}`).doc(String(item.id));
  await docRef.set(item);
  res.json(item);
});


// Remove the card item from that user cart only
app.post('/cart/remove', async (req, res) => {
  let { id, userId } = req.body;
  id = String(id);
  userId = String(userId);
  await db.collection(`cartItems_${userId}`).doc(id).delete();
  res.json({ id });
});

// Clear All the cart items of that user only
app.post('/cart/clear', async (req, res) => {
  const userId = req.body.uid;
  const snapshot = await db.collection(`cartItems_${userId}`).get();
  snapshot.docs.forEach(doc => doc.ref.delete());
  res.json({ message: 'Cart cleared' });
});

// I am having uid also so only show cart items of that user whose uid matches
app.get('/cart', async (req, res) => {
  const userId = req.query.uid;
  const snapshot = await db.collection(`cartItems_${userId}`).get();
  const items = snapshot.docs.map(doc => doc.data());
  res.json(items);
});




app.post('/order/add', async (req, res) => {
  const { uid, order } = req.body;
  const docRef = db.collection(`orders_${uid}`).doc();
  await docRef.set(order);
  res.json(order);
});


//  show all orders of that user whose uid matches 
app.get('/order', async (req, res) => {
  const userId = req.query.uid;
  const snapshot = await db.collection(`orders_${userId}`).get();
  const orders = snapshot.docs.map(doc => doc.data());
  res.json(orders);
});


app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
