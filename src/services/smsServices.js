const axios = require("axios");
const sendOTPSms = async (phone, OTP) => {
  try {
    let auth = `authorization=${process.env.FASTTOSMS_KEY}`;
    const finalURL = `https://www.fast2sms.com/dev/bulkV2?${auth}&route=otp&variables_values=${OTP}&numbers=${phone}`;
    console.log(finalURL, "Final URL");
    const res = await axios.get(`${finalURL}`);
    console.log(res.data, "Response of OTP Send");
    if (res?.data?.return === true) {
      return res?.data;
    } else {
      return { data: "Couldn't send otp" };
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = { sendOTPSms };
        