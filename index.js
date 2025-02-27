const express=require('express');
const jwt = require('jsonwebtoken');

const cors=require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app=express();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const port= process.env.PORT|| 5020;

//middle ware-------

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://ome-s-heaven.web.app",
    "https://ome-s-heaven.firebaseapp.com",
  ]
}));
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
    //await client.connect();
    const userCollection = client.db("omesHeaven").collection('users');
    const apartmentCollection = client.db("omesHeaven").collection('apartments');
    const agreementCollection = client.db("omesHeaven").collection('agreement');
    const announcementCollection = client.db("omesHeaven").collection('announcement');
    const paymentCollection = client.db("omesHeaven").collection('payment');
    const couponCollection = client.db("omesHeaven").collection('coupon');
    // Send a ping to confirm a successful connection


    //Post operation

    app.post('/coupon', async(req,res)=>{
      const coupon=req.body
      console.log(coupon)
      const result=await couponCollection.insertOne(coupon)
        res.send(result)
    })


    app.post("/create-payment-intent", async(req,res)=>{
      const {price}=req.body
      const amount= parseInt(price*100)
      const paymentIntent=await stripe.paymentIntents?.create({
        amount:amount,
        currency:'usd',
        payment_method_types:['card']
      })
      res.send({
        clientSecret: paymentIntent?.client_secret,
      });
    })

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

    app.post("/create-payment-intent", async(req,res)=>{
      const {price}=req.body

      const amount= parseInt(price*100)
      console.log(amount)
      const paymentIntent=await stripe.paymentIntents.create({
        amount:amount,
        currency:'usd',
        payment_method_types:['card']
      })
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    })

   
    app.post('/payment', async(req,res)=>{
      const payment=req.body
      console.log(payment)
      const result=await paymentCollection.insertOne(payment)
        res.send(result)
    })



    //verify token------
    const verifyToken=(req,res,next)=>{
      console.log('inside verify token', req.headers.authorization)
      if(!req.headers.authorization){
        return res.status(401).send({message:'forbidden access'})
      }
      const token=req.headers.authorization.split(' ')[1]
      jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
        if(err){
          return res.status(401).send({message:'forbidden access'})
        }
        req.decoded=decoded
        next()

      })
    }

    app.post('/jwt', async(req,res)=>{
      const user=req.body
      console.log(user)
      const token=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'365d'})
      res.send({token})
    })

    app.post('/payment', async(req,res)=>{
      const payment=req.body
      console.log(payment)
      const result=await paymentCollection.insertOne(payment)
        res.send(result)
    })

    app.post('/coupon', async(req,res)=>{
      const coupon=req.body
      console.log(payment)
      const result=await couponCollection.insertOne(coupon)
        res.send(result)
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
    app.get("/coupon", async(req,res)=>{
        const cursor=await couponCollection.find()
        const coupon=await cursor.toArray(cursor)
        res.send(coupon)
    })

    app.get("/allUsers",verifyToken, async(req,res)=>{
     // console.log('inside verify token', req.headers.authorization)
        const cursor=await userCollection.find()
        const user=await cursor.toArray(cursor)
        res.send(user)
    })

    app.get("/agreement",verifyToken, async(req,res)=>{
      console.log('inside verify token of agreement', req.headers.authorization)
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

    app.get("/payment",verifyToken, async(req,res)=>{
      const email=req.query.email
      const query={email:email}
      const cursor=await paymentCollection.find(query)
      const payment=await cursor.toArray(cursor)
      res.send(payment)
  })

  app.get("/payment",verifyToken, async(req,res)=>{
    const cursor=await paymentCollection.find()
    const payment=await cursor.toArray(cursor)
    res.send(payment)
})








    //Delete operation--------
    app.delete('/agreement/:id', async(req,res)=>{
      const id=req.params.id
      const query={_id: new ObjectId(id)}
      const result= await agreementCollection.deleteOne(query)
      res.send(result)
    })

    app.delete('/coupon/:id', async(req,res)=>{
      const id=req.params.id
      console.log(id)
      const query={_id: new ObjectId(id)}
      const result= await couponCollection.deleteOne(query)
      res.send(result)
    })

    //Patch operation------
    app.patch("/agreement",verifyToken, async(req,res)=>{
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



    //await client.db("admin").command({ ping: 1 });
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