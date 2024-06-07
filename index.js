const express=require('express');
const jwt = require('jsonwebtoken');
const cors=require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app=express();
const port= process.env.PORT|| 5020;

//middle ware-------

app.use(cors());
app.use(express.json());

//user name:omesHeaven password:15oXqlyO12gfEUtT

//database start----


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mnncxar.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(process.env.DB_PASS)
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
    const userCollection = client.db("omesHeaven").collection('users');
    const apartmentCollection = client.db("omesHeaven").collection('apartments');
    const agreementCollection = client.db("omesHeaven").collection('agreement');
    const announcementCollection = client.db("omesHeaven").collection('announcement');
    // Send a ping to confirm a successful connection

    //Post operation

    

    app.post("/users", async(req,res)=>{
        const newUser=req.body
        const result=await userCollection.insertOne(newUser)
        res.send(result)
    })

    app.post("/announcements", async(req,res)=>{
        const announcement=req.body
        const result=await announcementCollection.insertOne(announcement)
        res.send(result)
    })

    app.post("/agreementInfo", async(req,res)=>{
        const agreementInfo=req.body
        const query= {email:agreementInfo.email}
        const checkInfo=await agreementCollection.findOne(query)
        if(checkInfo){
          return res.send({message:'user already exist', insertedId:null})
        }
        const result=await agreementCollection.insertOne(agreementInfo)
        res.send(result)
    })

    app.post('/jwt', async(req,res)=>{
      const user=req.body
      console.log(user)
      const token=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'365d'})
      res.send({token})
    })

    //get operation
    app.get("/users", async(req,res)=>{
        const email=req.query?.email
        const query={email:email}
        const user=await userCollection.findOne(query)
        res.send(user)
    })

    app.get("/agreementInfo", async(req,res)=>{
        const email=req.query.email
        const query={email:email}
        const agreementData=await agreementCollection.findOne(query)
        res.send(agreementData)
    })


    app.get("/users", async(req,res)=>{
        const cursor=await userCollection.find()
        const user=await cursor.toArray(cursor)
        res.send(user)
    })

    app.get("/allUsers", async(req,res)=>{
        const cursor=await userCollection.find()
        const user=await cursor.toArray(cursor)
        res.send(user)
    })

    app.get("/agreement", async(req,res)=>{
        const cursor=await agreementCollection.find()
        const agreement=await cursor.toArray(cursor)
        res.send(agreement)
    })


    app.get("/apartment", async(req,res)=>{
        const cursor=await apartmentCollection.find()
        const user=await cursor.toArray(cursor)
        res.send(user)
    })

    app.get("/announcements", async(req,res)=>{
        const cursor=await announcementCollection.find()
        const announcements=await cursor.toArray(cursor)
        res.send(announcements)
    })

    //Delete operation--------
    app.delete('/agreement/:id', async(req,res)=>{
      const id=req.params.id
      const query={_id: new ObjectId(id)}
      const result= await agreementCollection.deleteOne(query)
      res.send(result)
    })

    //Patch operation------
    app.patch("/agreement", async(req,res)=>{
      const email=req.query.email
      const query={email:email}
      const agreementAcceptDate = new Date();
      const updateDoc={
        $set:{
          status:'checked',
          agreementAcceptDate
        }
      }
      const agreementData=await agreementCollection.updateOne(query,updateDoc)
      res.send(agreementData)
  })

    app.patch("/user", async(req,res)=>{
      const email=req.query.email
      const query={email:email}
      const updateDoc={
        $set:{
          userStatus:'member'
        }
      }
      const userData=await userCollection.updateOne(query,updateDoc)
      res.send(userData)
  })

    app.patch("/singleUser", async(req,res)=>{
      const email=req.query.email
      const query={email:email}
      const updateDoc={
        $set:{
          userStatus:'user'
        }
      }

      const userData=await userCollection.updateOne(query,updateDoc)
      res.send(userData)
  })



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

//database end----

app.get("/", (req,res)=>{
    res.send('Omes Heaven is running')
})

app.listen(port,()=>{
    console.log(`omes heaven server is running on port ${port}`)
})