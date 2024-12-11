/**
 * authConstant.js
 * @description :: constants used in authentication
 */

const JWT = {
    SECRET_KEY: "KINDASOLUTIONSPVTLTDIT",  
    USER_SECRET: "USERSECRETACCESSKEY",  
    USER_REFRESH_SECRET: "USERREFRESHSECRETACCESSKEY",  
    ADMIN_SECRET: "adminUserStricture",
    EXPIRES_IN: 60,
    REFRESH_EXPIRES_IN: 70
};
  
const COUNTRY_CODE = {
    INDIA: "+91",
    ITALY: "+39",
    AFGHANISTAN: "+93",  
    FRANCE: "+33",
    GERMANY: "+49"
  };
  
  const USER_TYPES = {
    User: 1,
    Admin: 2,
  };
  
  const PLATFORM = {
    DEVICE: 1,
    ADMIN: 2,
  };
  
  let LOGIN_ACCESS = {
    [USER_TYPES.User]: [PLATFORM.DEVICE],
    [USER_TYPES.Admin]: [PLATFORM.ADMIN],
  };
  
  const MAX_LOGIN_RETRY_LIMIT = 3;
  const LOGIN_REACTIVE_TIME = 2;
  
  const SEND_LOGIN_OTP = { SMS: 1 };
  const DEFAULT_SEND_LOGIN_OTP = SEND_LOGIN_OTP.SMS;
  
  const FORGOT_PASSWORD_WITH = {
    LINK: {
      email: true,
      sms: false,
    },
    EXPIRE_TIME: 60,
  };
  
  module.exports = {
    JWT,
    USER_TYPES,
    PLATFORM,
    MAX_LOGIN_RETRY_LIMIT,
    LOGIN_REACTIVE_TIME,
    SEND_LOGIN_OTP,
    DEFAULT_SEND_LOGIN_OTP,
    FORGOT_PASSWORD_WITH,
    LOGIN_ACCESS,
    COUNTRY_CODE
  };
  