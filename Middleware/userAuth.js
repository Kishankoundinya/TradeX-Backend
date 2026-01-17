const jwt =require('jsonwebtoken');

const userAuth=async(req,res,next)=>{
    const {token}=req.cookies;

    if(!token){
        return res.json({Succes:false,message:'Not Authorized.Login Again'})
    }
    try {
        const tokenDecode=jwt.verify(token,process.env.JWT_SECRET_KEY);
        if(tokenDecode.id){
            req.user = { id: tokenDecode.id };
        }else{
            res.json({Succes:false,message:'Not Authorized.Login Again'})
        }
        next();
        
    } catch (e) {
        return res.json({ Success: false, message: e.message });
    }

}
module.exports={userAuth};