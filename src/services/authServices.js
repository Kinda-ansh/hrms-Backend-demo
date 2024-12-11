// /**
//  * auth.js
//  * @description :: functions used in authentication
//  */


const jwt = require('jsonwebtoken')
// const AppError = require('../utils/error/AppError')
const {  JWT } = require("../constants/authConstant");
// const signToken = async(id) => {
//     return await jwt.sign({ id }, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_EXPIRES_IN
//     })
// }

const generateToken  = async (user,SECRET_KEY,expiresIn) => {
  return await jwt.sign(user, SECRET_KEY, expiresIn ? { expiresIn } : {});
}; 

const adminSignToken = async(id) =>{
  return await jwt.sign({ id }, process.env.JWT_SECRET , {
    expiresIn: '7d'
})
} 



const verifyUserToken = async (token, res) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT.USER_SECRET, (err, decoded) => {
      if (err) {
        res.badRequest({ message: "Token is not accessible!" });
        reject(new Error("Token verification failed"));
      } else {
        resolve(decoded);
      }
    });
  });
};
const verifyAdminToken = async (token, res) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.badRequest({ message: "Token is not accessible!" });
        reject(new Error("Token verification failed"));
      } else {
        resolve(decoded);
      }
    });
  });
};
// const verifyMasterToken = async (token, res) => {
//   return new Promise((resolve, reject) => {
//     jwt.verify(token, process.env.JWT_SECRET_MASTER, (err, decoded) => {
//       if (err) {
      
//         res.badRequest({ message: "Token is not accessible!" });
//         reject(new Error("Token verification failed"));
//       } else {
//         resolve(decoded);
//       }
//     });
//   });
// };


module.exports = {
    generateToken,
    verifyAdminToken, 
    verifyUserToken,
    adminSignToken
}