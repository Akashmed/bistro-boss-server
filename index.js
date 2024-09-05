const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wwbu2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        await client.connect();
        const menuCollection = client.db('bossDB').collection('menu');
        const reviewsCollection = client.db('bossDB').collection('reviews');

        app.get('/menu', async (req, res) => {
            let query = {};
            if (req?.query?.category) {
                query = { category: req.query.category }
            }
            const page = parseInt(req.query.page) || 0;
            const size = parseInt(req.query.size) || 6;

            let result = await menuCollection.find(query).toArray();
            if(req?.query?.page){
                result = await menuCollection.find(query).skip(page * size).limit(size).toArray();
            }
            const totalItems = await menuCollection.countDocuments(query);

            res.send({
                items: result,
                totalItems: totalItems
            });
        })



        app.get('/reviews', async (req, res) => {
            const result = await reviewsCollection.find().toArray();
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Bistro is running');
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})