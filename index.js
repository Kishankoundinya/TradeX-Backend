const express = require("express");
const mongoose = require("mongoose");
const connectDB =require('./Config/db');
const bodyParser=require('body-parser');
const cookieParser = require('cookie-parser');
const authRouter= require('./routes/authRoutes')
const cors = require('cors');
const { userRouter } = require("./routes/userRoutes");
const {HoldingModel}=require('./Model/HoldingModel')
const {PositionsModel}=require('./Model/PositionsModel')
const PORT = process.env.PORT || 3003;
const app = express();
app.use(express.json())
app.use(bodyParser.json());
require("dotenv").config();
app.use(cookieParser());
app.use(cors({
  origin: /^http:\/\/localhost:\d+$/, 
  credentials: true
}));


//////////////// Connecting the DB/////////////////////
connectDB();


app.get('/allHoldings',async(req,res)=>{
     let allHoldings= await HoldingModel.find({});
     console.log(allHoldings)
     res.json(allHoldings);
});

app.get('/allPositions',async(req,res)=>{
     let allPositions= await PositionsModel.find({});
     res.json(allPositions);
});

/////////////////API Endpoint/////////////
app.get('/',(req,res)=>{
     res.send("api working succesfully")
})
app.use('/api/auth',authRouter)
app.use('/api/user',userRouter)


app.listen(PORT, () => {
    console.log(`app is listining on ${PORT}`)
})


