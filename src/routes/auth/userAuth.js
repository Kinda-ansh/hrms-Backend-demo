/**
 * UserAuthRoutes.js
 * @description :: API routes for User Auth Controller.
 */


const express = require('express');
const authController = require('../../controller/auth/userAuthController');
const {
    checkUserAuthenticate
  } = require("../../middleware/Authenticate");


const router = express.Router();

router.route('/signup').post(authController.signUp);
router.route('/login').post(authController.login);
router.route('/my_profile').get(checkUserAuthenticate, authController.getUserProfile);
// testing
router.route("/updateImage").put(checkUserAuthenticate,authController.updateProfileImage);
//testing end
router.route('/resend_otp').post(authController.UserResendVerificationMail);
router.route('/verify_otp').post(authController.UserVerifyEmail);
router.route('/update_profile').put(checkUserAuthenticate, authController.updateUserProfile);  
router.route('/forgot_password').post(authController.UserForgotPassword);  
router.route('/reset_password').post(authController.UserResetPassword);  
router.route('/delete_account_otp').post(checkUserAuthenticate, authController.deleteAccountOtp);  
router.route('/delete_account').post(checkUserAuthenticate, authController.deleteAccount);  

module.exports = router 
