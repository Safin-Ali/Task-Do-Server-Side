const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const port = process.env.PORT || 5000;
const {MongoClient,} = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const uri = `mongodb+srv://${process.env.MONGODB_USER_NAME}:${process.env.MONGODB_USER_PASS}@cluster01.rhyj5nw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri)

app.use(cors());
app.use(express.json());

async function run () {
    try{

        const taskDoDB = client.db('Task-Do');
        const illustrationImgsDB = client.db('illustration-images');
        const avatarImgs = illustrationImgsDB.collection('avatar');
        const userInfo = taskDoDB.collection('user-Info');

        app.get('/',(req,res)=>{
            res.send('Welcome Task Do API')
        })

        app.post('/user',async (req,res)=>{
            const {userEmail,userGender,userName,userAvatar} = req.body;
            const result = await userInfo.insertOne({userEmail,userAvatar,userName,userGender,time: new Date()});
            res.send(result)
        })

        app.get('/avatar',async (req,res)=>{
            const result = await avatarImgs.findOne({});
            res.send(result)
        })

    }
    catch(error){
        console.log(error.message)
    }
}

run()

app.listen(port,()=>{
    console.log(`Server Running On ${port}`)
})

