/**
 * firebaseController.js
 * @description : exports action methods for firebase.
 */
const Device = require("../../model/Device");
const dbService = require("../../utils/dbServices");
const {
  sendNotificationToAll,
} = require("../../config/firebase/firebaseConfig");
const path = require("path");
const Notification = require("../../model/Firebase/Notification");
const { upload, parseForm, deleteFileS3 } = require("../../services/fileUploadServices");
const { ImageRule } = require("../../services/fileValidator");
const { default: mongoose } = require("mongoose");


/**
 * @description : API to send notifications to all devices.
 * This API accessible by Admin and Master Admin Only.
 * This API handles file upload for the notification image, stores it in AWS S3, and sends notifications to all devices.
 * It extracts the title, message body, and message URL from the form data, processes the image, and sends notifications to devices with FCM tokens.
 * If the notification is successfully sent, it stores the notification data in the database.
 *
 * @param {Object} req - The request object, containing fields and files.
 * @param {Object} res - The response object to send the result of the operation.
 *
 * @returns {Object} - JSON response with the status, message, and data:
 * - 200: Notification successfully sent.
 * - 400: If the image file is missing.
 * - 500: If an internal server error occurs.
 */
const sendAllNotificationApi = async (req, res) => {
  try {
    const { fields, files } = await parseForm(req);

    const { title, msgbody, msgUrl } = fields;

    if (!files || !files["image"]) {
      return res.status(400).json({ message: "File is missing" });
    }

    const uploadedImage = await upload(
      files["image"],
      ImageRule["notification"]
    );

    let dataToCreate = {
      title: title[0],
      msgbody: msgbody[0],
      image: `https://sarkariprivatejobs.s3.ap-south-1.amazonaws.com/assets/images/notify/${uploadedImage}`,
      msgUrl: msgUrl[0],
    };

    let receiveTokens = [];
    const findData = await dbService.findMany(Device);

    findData.forEach((val) => {
      receiveTokens.push(val.FCMToken);
    });

    await sendNotificationToAll(
      dataToCreate.title,
      dataToCreate.msgbody,
      dataToCreate.image,
      receiveTokens,
      msgUrl
    );

    const createdData = await dbService.create(Notification, dataToCreate);

    if (!createdData) {
      return res.badRequest({ message: "Failed to create news data." });
    }

    return res.success({
      data: createdData,
      message: "Notification successfully sent.",
    });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};


/**
 * @description : API to fetch all notifications.
 * This API accessible by Admin and Master Admin Only.
 * This API retrieves all notifications stored in the database and returns them in the response.
 * If no notifications are found, it sends a 'not found' response.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object to send the result of the operation.
 *
 * @returns {Object} - JSON response with the status, message, and data:
 * - 200: Returns all notifications successfully.
 * - 404: If no notifications are found.
 * - 500: If an internal server error occurs.
 */
const getAllNotification = async (req, res) => {
  try {
    const allNotification = await Notification.find();

    if (!allNotification) {
      return res.notFound({ message: "there is no notification" });
    }

    return res.success({
      data: {
        allNotification,
      },
    });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};


/**
 * @description : API to save device token for Android app (SPJ).
 * This API receives the device token from the request body and checks if the token already exists in the database.
 * If the token is found, it returns a 'bad request' response. If not, it saves the new token.
 *
 * @param {Object} req - The request object containing the device token in the body.
 * @param {Object} res - The response object to send the result of the operation.
 *
 * @returns {Object} - JSON response with the status, message, and data:
 * - 200: Token saved successfully.
 * - 400: If the token already exists.
 * - 500: If an internal server error occurs.
 */
const saveToken = async (req, res) => {
  const { deviceToken } = req.body;

  try {
    const findData = await dbService.findOne(Device, {
      FCMToken: deviceToken,
    });

    if (findData) {
      return res.badRequest({ message: "token already exist." });
    }

    const dataToCreate = {
      FCMToken: deviceToken,
    };

    await dbService.create(Device, dataToCreate);
    return res.success({ message: "Token saved successfully." });
  } catch (error) {
    return res.internalServerError({ message: "Internal server error." });
  }
};


/**
 * @description : API to get all notifications within a specified number of days for the Android app (SPJ).
 * This API retrieves notifications created within the past 'days' from the query parameter (defaults to 7 days if not provided).
 * Notifications are sorted by creation date in descending order (most recent first).
 *
 * @param {Object} req - The request object, containing an optional 'days' query parameter.
 * @param {Object} res - The response object to send the result of the operation.
 *
 * @returns {Object} - JSON response with the status, message, and data:
 * - 200: Returns notifications successfully, including the count of notifications.
 * - 404: If no notifications are found within the specified time frame.
 * - 500: If an internal server error occurs.
 */
const getAllNotificationInApp = async (req, res) => {
  try {
    // Get the 'days' from the query parameter, default to 7 if not provided
    const days = parseInt(req.query.days) || 7;
    
    // Calculate the date 'days' ago from today
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const allNotification = await Notification.find({
      createdAt: { $gte: fromDate },
    }).sort({ createdAt: -1 });

    // If no notifications are found
    if (!allNotification || allNotification.length === 0) {
      return res.notFound({ message: `There are no notifications from the last ${days} days.` });
    }

    return res.success({
      data: {
        notifications: allNotification,
        count: allNotification.length, // count of notifications
      },
    });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};






/**
 * @description : API to delete multiple notifications by their IDs.
 * This API takes an array of notification IDs from the request body and deletes the corresponding notifications.
 * It checks if the provided IDs are valid ObjectIds, finds the records, and deletes them from the database.
 *
 * @param {Object} req - The request object, containing the array of notification IDs in the body.
 * @param {Object} res - The response object to send the result of the operation.
 *
 * @returns {Object} - JSON response with the status, message, and data:
 * - 200: Notifications deleted successfully.
 * - 400: If the IDs format is invalid (not an array or invalid ObjectId).
 * - 404: If no records are found for the provided IDs.
 * - 500: If an internal server error occurs.
 */


// const deleteManyNotification = async (req, res) => {
//   const { ids } = req.body;
//   try {
//     // Validate if 'ids' is an array and all items are valid ObjectIds
//     if (!Array.isArray(ids) || !ids.every((id) => mongoose.Types.ObjectId.isValid(id))) {
//       return res.badRequest({
//         message: "Invalid IDs format. Ensure 'ids' is an array of valid ObjectId strings.",
//       });
//     }

//     const objectIds = ids.map((id) => mongoose.Types.ObjectId(id));

//     // Check if notifications exist for the provided IDs
//     const findData = await dbService.findMany(Notification, { _id: { $in: objectIds } });
//     if (findData.length === 0) {
//       return res.recordNotFound({
//         message: "No records found for the provided IDs.",
//       });
//     }

//     // Delete the notifications
//     await dbService.deleteMany(Notification, { _id: { $in: objectIds } });

//     return res.success({
//       message: "Notifications deleted successfully.",
//     });
//   } catch (error) {
//     return res.internalServerError({ message: error.message });
//   }
// };


const deleteManyNotification = async (req, res) => {
  const { ids } = req.body;
  try {
    // Validate if 'ids' is an array and all items are valid ObjectIds
    if (!Array.isArray(ids) || !ids.every((id) => mongoose.Types.ObjectId.isValid(id))) {
      return res.badRequest({
        message: "Invalid IDs format. Ensure 'ids' is an array of valid ObjectId strings.",
      });
    }

    const objectIds = ids.map((id) => mongoose.Types.ObjectId(id));

    // Check if notifications exist for the provided IDs
    const findData = await dbService.findMany(Notification, { _id: { $in: objectIds } });
    if (findData.length === 0) {
      return res.recordNotFound({
        message: "No records found for the provided IDs.",
      });
    }

    // Delete associated images from S3 for each notification
    for (const notification of findData) {
      if (notification.image) { 
        const folderName = ImageRule.notification.path;
        // Extract the file name from the URL
        const fileName = path.basename(notification.image);
        const filePath = `${folderName}/${fileName}`;

        // Delete the file from S3 using the deleteFile function
        try {
          await deleteFileS3(filePath);
        } catch (error) {
          console.error(`Failed to delete file from S3: ${filePath}`, error);
        }
      }
    }

    // Delete the notifications from the database
    await dbService.deleteMany(Notification, { _id: { $in: objectIds } });

    return res.success({
      message: "Notifications and associated images deleted successfully.",
    });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};



module.exports = {
  sendAllNotificationApi,
  getAllNotification,
  getAllNotificationInApp,
  saveToken,
  deleteManyNotification
};
