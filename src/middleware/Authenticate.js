const { verifyUserToken } = require('../services/authServices')
const User = require('../model/User')
const mongoose = require("mongoose")

const checkUserAuthenticate = async (req,res,next) => {
 
        try {
          let token;
          let userData;
      
          if (
            req.headers?.authorization &&
            req.headers?.authorization?.startsWith("Bearer")
          ) {
            token = req.headers.authorization.split(" ")[1];
          }
        
          if (!token) {
            return res.badRequest({ message: "User is not authorized!" });
          }

          // userInformation
          const decodedUserAuthData = await verifyUserToken(token, res);
         
          userData = await User.findOne( {
            _id: mongoose.Types.ObjectId(decodedUserAuthData.id),
          })

          if (!userData) {
            return res.badRequest({ message: "User is not authorized!" });
          }
      
          req.user = userData;
      
          next();
        }
        catch (error) {
          next(error);
        }
}


module.exports = {
    checkUserAuthenticate
}