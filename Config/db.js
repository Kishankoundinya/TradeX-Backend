const mongoose=require('mongoose');
const connectDB=async()=>{
    try{
        await mongoose.connect(`${process.env.MONGO_URL}/zerodha`)
        console.log("Database connected!")
    }
    catch(e){
            console.log(e);
            process.exit(1);
    }
};

module.exports=connectDB;