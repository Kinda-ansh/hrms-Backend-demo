const dbService = require("../../utils/dbServices");
const User = require("../../model/User");
const common = require("../../utils/common");
const { sendEmail } = require("../../services/nodemailerService");
const { JWT } = require("../../constants/authConstant");
const { generateToken } = require("../../services/authServices");
const bcrypt = require("bcrypt");
const {
  userValidation,
  signUpValidation,
  loginValidation,
} = require("../../utils/validations/validation");
const { upload, parseForm } = require("../../services/fileUploadServices");
const { ImageRule } = require("../../services/fileValidator");

/**
 * @description : Resend verification email to a user.
 * @param {Object} req : The request object including body for email.
 * @param {Object} res : The response object to send back the resend verification status.
 * @return {void}
 */

const UserResendVerificationMail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.badRequest({
        message: "Insufficient request parameters! email is required.",
      });
    }
    const lowerCaseEmail = email.toLowerCase();
    const findData = await dbService.findOne(User, { email: lowerCaseEmail });

    if (!findData) {
      return res.recordNotFound({
        data: findData,
        message: "Account doesn't exist! Please register first.",
      });
    }

    if (findData.isverify === true) {
      return res.badRequest({ message: "Account already verified." });
    }
    const otp = common.randomNumber();
    const data = await User.updateOne({ email: findData.email }, { $set: { otp: otp } });
    const subject = "Re-send account verification OTP.";
    await sendEmail(findData.username, subject, findData.email, otp);
    return res.success({
      data: data,
      message: "Please check your email to verify your account.",
    });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : Verify user's email using OTP.
 * @param {Object} req : The request object including body for email and OTP.
 * @param {Object} res : The response object to send back the verification status.
 * @return {void}
 */
const UserVerifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
   
    if (!otp) {
      return res.badRequest({ message: "Please enter the OTP" });
    }

    if (otp.length > 6) {
      return res.badRequest({ message: "OTP is too long!" });
    }

    const lowerCaseEmail = email.toLowerCase();

    const userData = await dbService.findOne(User, { email: lowerCaseEmail });

    if (!userData) {
      return res.recordNotFound({ message: "Please enter valid Email!" });
    }

    if (userData.isverify == true) {
      return res.badRequest({
        message: "Account has been already verified. You can login.",
      });
    }

    if (userData.otp !== otp) {
      return res.badRequest({ message: "Wrong OTP! Please enter again." });
    } else {
      await User.findByIdAndUpdate(
        { _id: userData.id },
        { $set: { isverify: true, otp: "" } },
        { new: true }
      );
    }

    return res.success({
      message: "Your account has been successfully verified.",
    });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : User sign-up process including validation, checking existing user, and sending verification OTP.
 * @param {Object} req : The request object including validated body parameters for full name, mobile number, email, and password.
 * @param {Object} res : The response object to send back the sign-up status and verification message.
 * @return {Object} : created User. {status, message, data}
 */

const signUp = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = signUpValidation.validate(req.body);
    if (error) {
      return res.badRequest({ message: error.details[0].message });
    }

    const { fullName, mobileNo, email, password } = value;

    const lowerCaseEmail = email.toLowerCase();

    // Checking if the User is already registered using the email or mobile number
    const findData = await dbService.findOne(User, {
      email: lowerCaseEmail,
    });

    if (findData) {
      return res.badRequest({ message: "User already registered" });
    }

    const dataToCreate = {
      fullName: fullName,
      mobileNo: mobileNo,
      email: lowerCaseEmail,
      password: password,
    };

    const createdData = await dbService.create(User, dataToCreate);

    if (!createdData) {
      return res.recordNotFound({ data: createdData });
    }
    const subject = "Account verification OTP.";
    const otp = common.randomNumber();
    await User.updateOne({ email: createdData.email }, { $set: { otp: otp } });

    sendEmail(createdData.fullName, subject, createdData.email, otp);

    return res.success({
      message: "Check your email and enter OTP to verify your account.",
    });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : get logged In user profile of single User from mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @fields : UserId.
 * @return {Object} : find User details. {status, message, data}
 */

const getUserProfile = async (req, res) => {
  try {
    // Finding the User record by ID
    const findData = await dbService.findOne(User, { _id: req.user.id });

    if (!findData) {
      return res.recordNotFound({ data: findData });
    }

    let data = {
      Users: findData,
    };

    return res.success({ data: data });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : User login process including validation, checking user existence, verification status, and password comparison.
 * @param {Object} req : The request object including validated body parameters for email and password.
 * @param {Object} res : The response object to send back the login status, access token, and refresh token upon successful login.
 * @return {Object} : created User . {status, message, data}
 */

const login = async (req, res) => {
  try {
    const { error, value } = loginValidation.validate(req.body);
    if (error) {
      return res.badRequest({ message: error.details[0].message });
    }

    const { email, password } = value;

    if (!email) {
      return res.badRequest({ message: "Please enter email." });
    }
   
    const lowerCaseEmail = email.toLowerCase();

    // Checking if the User is already registered using the email or mobile number
    const findData = await dbService.findOne(User, {
      email: lowerCaseEmail,
    });

    if (!findData) {
      return res.badRequest({ message: "User doesn't exist" });
    }

    if (findData.isverify === false) {
      return res.badRequest({
        message: "Please verify email to login your account.",
      });
    }
    if (findData.isBan === true) {
      return res.badRequest({
        message:
          "You cann't access your account. Your account has been suspended.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, findData.password);
    
    // If password matches, generate access and refresh tokens
    if (passwordMatch) {
      const accessToken = await generateToken(
        { id: findData._id },
        JWT.USER_SECRET,
        "7d"
      );
      const refreshToken = await generateToken(
        { id: findData._id },
        JWT.USER_REFRESH_SECRET,
        "30d"
      );

      const data = {
        user: findData,
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
      return res.success({ data: data });
    } else {
      return res.badRequest({ message: "Invalid email or password" });
    }
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : updation of Category in mongodb collection.
 * @param {Object} req : request including body for updated documents.
 * @param {Object} res : response of updated document
 * @return {Object} : updated category {status, message, data}
 */

const updateUserProfile = async (req, res) => {
  try {
    
    const { fullName, mobileNo, dob, education, occupation } = req.body;

    const dataToUpdate = {
      fullName: fullName,
      mobileNo: mobileNo,
      dob: dob,
      education: education,
      occupation: occupation,
    };

    const { error } = userValidation.validate(dataToUpdate);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const findData = await dbService.findOne(User, { _id: req.user.id });
    if (!findData) {
      return res.status(404).json({ message: "Record not found!" });
    }

    const profile = await dbService.updateOne(
      User,
      { _id: req.user.id },
      dataToUpdate
    );
    if (!profile) {
      return res.status(404).json({ message: "Record not found!" });
    }
    return res.status(200).json({ message: "Data has been updated." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @description : Sends an OTP to the user's email for account deletion verification.
 * @param {Object} req : The request object containing user ID for fetching user details.
 * @param {Object} res : The response object to send success message or error upon failure.
 * @return {void}
 */
const deleteAccountOtp = async (req, res) => {
  try {
    const findData = await dbService.findOne(User, {
      _id: req.user.id,
    });

    const subject = "📌 For Deleting My account from SarkariPrivateJobs.";
    const otp = common.randomNumber();
    await User.updateOne({ email: findData.email }, { $set: { otp: otp } });

    await sendEmail(findData.fullName, subject, findData.email, otp);

    return res.success({
      message: "Check your email and enter OTP to delete your account.",
    });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : Deletes the user account if the provided OTP matches the stored OTP.
 * @param {Object} req : The request object containing OTP for verification.
 * @param {Object} res : The response object to send success message or error upon failure.
 * @return {void}
 */
const deleteAccount = async (req, res) => {
  try {
    const { otp } = req.body;
    const findData = await dbService.findOne(User, {
      _id: req.user.id,
    });

    if (!otp) {
      return res.badRequest({ message: "OTP can't be empty." });
    }

    if (findData.otp !== otp) {
      return res.badRequest({ message: "Wrong OTP! Please enter again." });
    }

    await User.findByIdAndDelete({ _id: findData.id });

    return res.success({ message: "Your account has been deleted." });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : Initiates the process to reset user password by sending an OTP to the registered email.
 * @param {Object} req : The request object containing the user's email.
 * @param {Object} res : The response object to send success message or error upon failure.
 * @return {void}
 */
const UserForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const lowerCaseEmail = email.toLowerCase();

    const findData = await dbService.findOne(User, { email: lowerCaseEmail });

    if (!findData) {
      return res.recordNotFound({
        message: "User dosen't exist! Enter right email.",
      });
    }
    const subject = "Email for reset your password";
    const otp = common.randomNumber();
    const data = await User.updateOne({ email: findData.email }, { $set: { otp: otp } });
    await sendEmail(findData.fullName, subject, findData.email, otp);
    return res.success({
      data: data,
      message: "Please check your email any enter OTP to Reset your password.",
    });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : Resets the user password if OTP matches and updates the password in the database.
 * @param {Object} req : The request object containing email, OTP, and new password.
 * @param {Object} res : The response object to send success message or error upon failure.
 * @return {void}
 */
const UserResetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (otp.length > 6) {
      return res.badRequest({ message: "OTP is too long!" });
    }

    // Perform Joi validation
    const { error } = userValidation.validate({
      email,
      password,
    });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const lowerCaseEmail = email.toLowerCase();

    const userData = await dbService.findOne(User, { email: lowerCaseEmail });

    if (!userData) {
      return res.recordNotFound({ message: "Something went wrong!" });
    }
    if (!userData.otp == otp) {
      return res.recordNotFound({ message: "Please enter valid OTP" });
    }

    const hashedPassword = await bcrypt.hash(password, 8);
    await User.findByIdAndUpdate(
      { _id: userData.id },
      { $set: { password: hashedPassword, otp: "" } },
      { new: true }
    );
    return res.success({
      message:
        "Password has been changed. You can login with your new password",
    });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : upodate profile Image of single User from mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @fields : UserId.
 * @return {Object} : find User details. {status, message, data}
 */

const updateProfileImage = async (req, res) => {
  try {
    const userData = await dbService.findOne(User, { _id: req.user.id });
    if (!userData) {
      return res.badRequest({ message: "User doesn't exist." });
    }

    const { fields, files } = await parseForm(req);

    const normalizedFields = {};
    for (const key in fields) {
      if (fields.hasOwnProperty(key)) {
        normalizedFields[key] = fields[key][0];
      }
    }

    if (!files || !files["profileImage"]) {
      return res.badRequest({ message: "Profile Image is missing" });
    }

    const uploadedImage = await upload(
      files["profileImage"],
      ImageRule.user_profile,
      userData.profileImage ? userData.profileImage : null
    );

    const updatedData = await User.findByIdAndUpdate(
      { _id: userData.id },
      { $set: { profileImage: uploadedImage } },
      { new: true }
    );

    if (!updatedData) {
      return res.recordNotFound({ data: updatedData });
    }

    return res.success({ data: updatedData });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

module.exports = {
  signUp,
  login,
  getUserProfile,
  updateUserProfile,
  UserResendVerificationMail,
  UserVerifyEmail,
  UserForgotPassword,
  UserResetPassword,
  deleteAccountOtp,
  deleteAccount,
  updateProfileImage,
};
