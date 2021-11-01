const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient } = require('mongodb');
const { parse } = require('dotenv');
require('dotenv').config();


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nzlp2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('NexsTop');
        const tourPlaceCollection = database.collection('tourPlace');
        const locationCollection = database.collection('locations');
        const guidesCollection = database.collection('guideList');
        const usersCollection = database.collection('usersList');

        // GET LOCATIONS API
        app.get('/locations', async (req, res) => {
            const cursor = locationCollection.find({});
            const location = await cursor.toArray();
            res.send(location);
        })


        // GET TOUR PLACE(SERVICES) API
        app.get('/tourplaces', async (req, res) => {
            const cursor = tourPlaceCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })

        // GET GUIDES LIST API
        app.get('/guides', async (req, res) => {
            const cursor = guidesCollection.find({});
            const size = parseInt(req.query.size);
            let guide;
            if (size) {
                guide = await cursor.limit(size).toArray();
            }
            else {
                guide = await cursor.toArray();
            }
            res.send(guide);
            // console.log(guide);
        });

        // POST USER API
        app.post('/users/:id', async (req, res) => {
            const id = req.params.id;
            const userData = req.body;
            const result = await usersCollection.insertOne(userData);
            res.send(result);
        })

        // GET USER API
        app.get('/users', async (req, res) => {
            const search = req.query.search;
            const query = { email: search };
            const users = await usersCollection.find(query).toArray();
            let obj = {};

            users.map(user => {
                if (obj[user.product_id]) {
                    obj[user.product_id] = obj[user.product_id] + 1;
                }
                else {
                    obj[user.product_id] = 1;
                }
            });

            const usersPackage = [];

            for (const key in obj) {
                const id = parseInt(key);
                const query = { id: id };
                const package = await tourPlaceCollection.findOne(query);
                package.quantity = obj[key];
                usersPackage.push(package);
            }

            // console.log(usersPackage);
            res.send(usersPackage);
        });

        // DELETE FROM USER API
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { product_id: id };
            const result = await usersCollection.deleteMany(query);
            console.log(result);
            res.send(result);
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    console.log('Assignment 11 server is ready');
    res.send('Assignment server is ready');
})

app.listen(port, () => {
    console.log('listening at port ', port);
});