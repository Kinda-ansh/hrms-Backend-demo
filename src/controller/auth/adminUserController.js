// const Admin = require('../../model/Admin');
const User = require("../../model/User");
const { ImageRule } = require("../../services/fileValidator");
const dbService = require("../../utils/dbServices");

/**
 * @description : get data of single User from mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @fields : UserId.
 * @return {Object} : find User details. {status, message, data}
 */
const getUserDataById = async (req, res) => {
  try {
    // Finding the User record by ID
    const findData = await dbService.findOne(User, { _id: req.params.id });

    if (!findData) {
      return res.recordNotFound({ data: findData, message: "User not exist." });
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
 * @description : get all user from mongodb collection.
 * @param {Object} req : request including body for fetching document.
 * @param {Object} res : response of fetch document
 * @fields : adminAuthentication.
 * @return {Object} : find User details. {status, message, data}
 */
const getAllUserDataByAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const findData = await User.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

    if (!findData) {
      return res.recordNotFound({
        data: findData,
        message: "something went wrong",
      });
    }
    const totalUser = await User.countDocuments();

    const data = {
      Users: findData,
      baseurl: `${process.env.AWS_FILE_PATH + ImageRule.user_profile.path}/`,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUser / limit),
        totalItems: totalUser,
        itemsPerPage: limit,
      }
    }

    return res.success({ data: data });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

module.exports = { getUserDataById, getAllUserDataByAdmin };
