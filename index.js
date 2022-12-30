const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const {MongoClient, ObjectId,} = require('mongodb');
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
        const userTask = taskDoDB.collection('user-task');

        const jwtVerify = (req,res,next) =>{
            if(!req.headers.encryptjwt) return res.status(403).send('Forbidden');

            const encryptKey = req.headers.encryptjwt.split(' ')[1];

            jwt.verify(encryptKey,process.env.JSON_WEB_TOKEN,(error,decode)=>{
                if(error) return res.status(401).send('Unauthorized');

                req.body.decode = decode;
                return next();
            })
        }

        app.post('/crypto-jwt',(req,res)=>{
            const encryptKey = jwt.sign(req.body.email,process.env.JSON_WEB_TOKEN);
            res.send({encryptKey});
        });

        app.get('/',(req,res)=>{
            res.send('Welcome Task Do API')
        });

        app.post('/user',async (req,res)=>{
            const {userEmail,userGender,userName,userAvatar} = req.body;
            const result = await userInfo.insertOne({userEmail,userAvatar,userName,userGender,time: new Date()});
            res.send(result)
        });

        app.post('/add-task',async (req,res)=>{
            const {taskName,taskImgURL,userEmail,taskStatus} = req.body;
            const result = await userTask.insertOne({taskName,taskImgURL,userEmail,taskStatus,time: new Date()});
            res.send(result)
        });
        
        app.patch('/add-task',async (req,res)=>{
            const {id,email} = req.body;
            const filter = {_id: ObjectId(id), userEmail: email};
            const result = await userTask.updateOne(filter,{
                $set: {taskStatus: true}
            });
            res.send(result);
        });

        app.patch('/task-update',async (req,res)=>{
            const {id,email,updateValue} = req.body;
            const filter = {_id: ObjectId(id), userEmail: email};
            const result = await userTask.updateOne(filter,{
                $set: {taskName: updateValue}
            });
            if(result.modifiedCount > 0) {
                const newData = await userTask.find({userEmail: email,taskStatus: false}).toArray();
                return res.send({modifiedCount: true,updateData: newData})
            }
        });

        app.get('/my-task', jwtVerify, async (req,res)=> {
            const filter = {userEmail: req.headers.header,taskStatus: false};
            const result = await userTask.find(filter).toArray();
            res.send(result);
        });

        app.get('/avatar',async (req,res)=>{
            const result = await avatarImgs.findOne({});
            res.send(result)
        });

    }
    catch(error){
        console.log(error.message);
    }
}

run()

app.listen(port,()=>{
    console.log(`Server Running On ${port}`)
})

