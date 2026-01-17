const express = require("express");
const { userAuth } = require("../Middleware/userAuth");
const { getUserData } = require("../controllers/userController");
const userRouter = express.Router();


userRouter.get('/data',userAuth,getUserData);

module.exports={userRouter};