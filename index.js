const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  // console.log(authorization)

  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorized access' });
  }

  const token = authorization.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, message: 'unauthorized access' })
    }

    req.decoded = decoded;
    next();
  })
}


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ekuronr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const gadgetCollection = client.db("gadgetFLow").collection("gadgetCollection");
    const userCollection = client.db("gadgetFLow").collection("userCollection");
    const sellsCollection = client.db("gadgetFLow").collection("sellsCollection");


    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.send({ token })
    })

    app.get('/gadgetCollection', async (req, res) => {
      const result = await gadgetCollection.find().toArray();
      res.send(result);
    })



    app.delete('/gadgetdelete/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id)

      const query = { _id: new ObjectId(id) };
      const result = await gadgetCollection.deleteOne(query);
      res.send(result);
    });


    app.put('/gadgetdataupdate/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const userEdit = req.body;
      const option = { upsert: true }
      // console.log(userEdit, id)
      const updateEdit = {
        $set: {
          id: userEdit.product.id,
          name: userEdit.product.name,
          price: userEdit.product.price,
          quantity: userEdit.product.quantity,
          releaseDate: userEdit.product.releaseDate,
          brand: userEdit.product.brand,
          modelNumber: userEdit.product.modelNumber,
          category: userEdit.product.category,
          operatingSystem: userEdit.product.operatingSystem,
          connectivity: userEdit.product.connectivity,
          powerSource: userEdit.product.powerSource,
          features: {
            processor: userEdit?.product?.features?.processor,
            RAM: userEdit?.product?.features?.RAM,
            storageCapacity: userEdit?.product?.features?.storageCapacity,
            screenSize: userEdit?.product?.features?.screenSize,
          },
          img: userEdit.product.img,
        }
      }
      const result = await gadgetCollection.updateOne(filter, updateEdit, option);
      res.send(result);
    })


    app.post('/gadgetdataAdd', async (req, res) => {
      const query = req.body;
      console.log(query);
      const result = await gadgetCollection.insertOne(query);
      res.send(result);
    })

    //gadgetquantityUpadate

    app.patch('/gadgetquantityUpadate/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const userEdit = req.body;

      console.log(userEdit, id)
      if (userEdit.quantityies) {
        const updateEdit = {
          $set: {
            quantity: userEdit.quantityies,

          }
        }
        const result = await gadgetCollection.updateOne(filter, updateEdit);
        res.send(result);
      }

      else if(userEdit.quantityies && userEdit.status){

        console.log(userEdit.status)
        const updateEdit = {
          $set: {
            quantity: userEdit.quantityies,
            status: userEdit.status,

          }
        }
        const result = await gadgetCollection.updateOne(filter, updateEdit);
        res.send(result);
      }

    })



    app.post('/userdata', async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const exitingUser = await userCollection.findOne(query);
      if (exitingUser) {
        return res.send({ message: 'user already exist' })
      }

      const result = await userCollection.insertOne(user);
      res.send(result);
    })



    app.post('/sellsdata', async (req, res) => {
      const query = req.body;
      console.log(query);
      const result = await sellsCollection.insertOne(query);
      res.send(result);
    })




    // "headers":{"Access-Control-Allow-Origin":"*"}

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send("GadgetFLow is running");
})

app.listen(port, () => {
  console.log(`GadgetFlow is running on port ${port}`)
})























// const express = require('express');
// const app = express();
// const cors = require('cors');
// require('dotenv').config()
// const port = process.env.PORT || 5000;


// app.use(cors());
// app.use(express.json());

// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ekuronr.mongodb.net/?retryWrites=true&w=majority`;

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//     serverApi: {
//         version: ServerApiVersion.v1,
//         strict: true,
//         deprecationErrors: true,
//     }
// });


// client.connect().then(() => {
//     const usersCollection = client.db("gadgetFLow").collection("gadgetCollection");

//     // Routes that require database interaction
//     app.get('/user', async (req, res) => {
//         const result = await usersCollection.find().toArray();
//         res.send(result);
//     });

//     // Other routes can be defined here

//     // Ping MongoDB to confirm a successful connection
//     client.db("admin").command({ ping: 1 }).then(() => {
//         console.log("Pinged your deployment. You successfully connected to MongoDB!");

//         // Start the Express server after the database connection is established
//         app.listen(port, () => {
//             console.log(`GadgetFlow is running on port ${port}`);
//         });
//     }).catch(err => {
//         console.error("Error pinging MongoDB:", err);
//     });
// }).catch(err => {
//     console.error("Error connecting to MongoDB:", err);
// });





// async function run() {
//     try {


//         // Connect the client to the server	(optional starting in v4.7)
//         client.connect();

//         const usersCollection = client.db("gadgetFLow").collection("gadgetCollection");

//             // Routes that require database interaction
//             app.get('/user', async (req, res) => {
//                 const result = await usersCollection.find().toArray();
//                 res.send(result);
//             });

//         // Send a ping to confirm a successful connection
//         await client.db("admin").command({ ping: 1 });
//         console.log("Pinged your deployment. You successfully connected to MongoDB!");
//     } finally {
//         // Ensures that the client will close when you finish/error
//         //await client.close();
//     }
// }
// run().catch(console.dir);


// app.get('/', (req, res) => {
//     res.send("FoodVillage Server Is Running")
// });

// app.listen(port, () => {
//     console.log(`FoodVillage Server Is running on ${port}`);
// })



