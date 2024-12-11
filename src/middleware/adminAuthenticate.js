const { verifyAdminToken } = require('../services/authServices')
const Admin = require('../model/Admin')
const mongoose = require("mongoose")


/**
 * @description : Check and authenticate the admin user based on the provided token.
 * @param {Object} req : The request object including headers for authorization token.
 * @param {Object} res : The response object to send back authentication status.
 * @param {Function} next : The next middleware function.
 * @return {void}
 */

const checkAuthenticate = async (req,res,next) => {
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
            return res.badRequest({ message: "Token is not accessible!!" });
          }
      
          // userInformation
          const decodedUserAuthData = await verifyAdminToken(token, res);

          userData = await Admin.findOne( {
            _id: mongoose.Types.ObjectId(decodedUserAuthData.id),
          })

          if (!userData) {
            return res.badRequest({ message: "User is not authorized!" });
          }

          req.admin = userData;
      
          next();
        }
        catch (error) {
          next(error);
        }
}


/**
 * @description : Check and authenticate the Master admin based on the provided token.
 * @param {Object} req : The request object including headers for authorization token.
 * @param {Object} res : The response object to send back authentication status.
 * @param {Function} next : The next middleware function.
 * @return {void}
 */

// const checkMasterAuthenticate = async (req,res,next) => {
//         try {
//           let token;
//           let userData;
      
//           if (
//             req.headers?.authorization &&
//             req.headers?.authorization?.startsWith("Bearer")
//           ) {
//             token = req.headers.authorization.split(" ")[1];
//           }
      
//           if (!token) {
//             return res.badRequest({ message: "Token is not accessible!!" });
//           }
      
//           // userInformation
//           const decodedUserAuthData = await verifyMasterToken(token, res);

//           userData = await Admin.findOne( {
//             _id: mongoose.Types.ObjectId(decodedUserAuthData.id),
//           })

//           if (!userData) {
//             return res.badRequest({ message: "User is not authorized!" });
//           }

//           req.admin = userData;
      
//           next();
//         }
//         catch (error) {
//           next(error);
//         }
// }

// const checkRole = (roles) => async (req, res, next) => {
//   let { email } = req.admin;
//   //retrieve employee info from DB
//   const user = await Admin.findOne({ email });
//   !roles.includes(user.role)
//     ? res.status(401).json({ message :"Sorry you do not have access to this route" })
//     : next();
// };

const checkRole = (...roles) => async (req, res, next) => {
  try {
    const { email } = req.admin;
    const user = await Admin.findOne({ email });

    if (!user || !roles.includes(user.role)) {
      return res.status(401).json({ message: "Sorry, you do not have access to this route" });
    }

    next();
  } catch (error) {
    next(error);
  }
}


module.exports = {
    checkAuthenticate,
    checkRole
}