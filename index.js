const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("GO-TOUR");
    const packagesCollection = database.collection("Packages");
    const orderCollection = database.collection("Orders");
    // GET Multiple Package API
    app.get("/packages", async (req, res) => {
      const cursor = packagesCollection.find({});
      const packages = await cursor.toArray();
      res.send(packages);
    });
    // POST API || Add a package
    app.post("/packages", async (req, res) => {
      const package = req.body;
      console.log("hit the post api", package);

      const result = await packagesCollection.insertOne(package);
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
      res.json(result);
    });

    // GET SINGLE PACKAGE API
    app.get("/packages/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const package = await packagesCollection.findOne(query);
      res.json(package);
    });
    // Add Package Order API
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.json(result);
    });

    // GET ALL ORDERS FROM Orders API
    app.get("/orders/manageAllOrders", async (req, res) => {
      const query = {};
      const cursor = orderCollection.find(query);
      const allOrders = await cursor.toArray();
      res.json(allOrders);
    });
    // UPDATE API
    app.put("/status/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          status: data.isStatus,
        },
      };
      const result = await orderCollection.updateOne(query, updateDoc);
      res.json(result);
    });

    // DELETE API
    app.delete("/order/delete/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      console.log("hitting");
      const query = { _id: ObjectId(id) };
      console.log(query);
      const result = await orderCollection.deleteOne(query);

      res.json(result);
    });
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running GO-TOUR Server Now Or Never");
});
app.listen(port, () => {
  console.log("Running GO-TOUR Server on port", port);
});
