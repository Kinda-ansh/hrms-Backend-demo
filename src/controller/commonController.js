/**
 * CommonController.js
 * Created API for Common API
 */

const dbService = require("../utils/dbServices");
const Common = require("../model/Common");

/**
 * @description : create document of Common in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document.
 * @return {Object} : created Common. {status, message, data}
 */
const addCommon = async (req, res) => {
  try {
    const { type, content } = req.body;

    // Validate fields
    if (!type) {
      return res.badRequest({ message: "Type is required!" });
    }
    if (!content) {
      return res.badRequest({ message: "Content is required!" });
    }

    // Check if Common with the same type already exists
    const findData = await dbService.findOne(Common, { type: type });
    if (findData) {
      return res.badRequest({ message: "Common with the same type already exists." });
    }

    const dataToCreate = {
      type: type,
      content: content,
    };

    // Create new Common in the database
    const createdData = await dbService.create(Common, dataToCreate);

    if (!createdData) {
      return res.badRequest({ message: "Failed to create Common data." });
    }

    return res.success({
      data: createdData,
      message: "Common created successfully.",
    });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : get Common in mongodb collection.
 * @param {Object} res : response of Common
 * @return {Object} : Single Common Response. {status, message, data}
 */
const getCommon = async (req, res) => {
  try {
    const findData = await dbService.findOne(Common, { _id: req.params.id });

    if (!findData) {
      return res.recordNotFound({ data: findData });
    }

    return res.success({ data: findData });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : get all Common in mongodb collection.
 * @param {Object} res : response of all Common
 * @return {Object} : all Common. {status, message, data}
 */
const getAllCommon = async (req, res) => {
  try {

    const data = await Common.find({})

    if (!data.length) {
      return res.recordNotFound({ data: data });
    }

    const totalCommon = await Common.countDocuments({});

    const responseData = {
      TotalCommon: totalCommon,
      data,
    };

    return res.success({ data: responseData });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : updation of Common in mongodb collection.
 * @param {Object} req : request including body for updated documents.
 * @param {Object} res : response of updated document
 * @return {Object} : updated Common {status, message, data}
 */
const updateCommon = async (req, res) => {
  try {
    const { content } = req.body;

    const findData = await dbService.findOne(Common, { _id: req.params.id });

    if (!findData) {
      return res.recordNotFound({ data: findData });
    }

    const dataToUpdate = {
      content: content,
    };

    const updatedCommon = await dbService.updateOne(
      Common,
      { _id: req.params.id },
      dataToUpdate
    );

    if (!updatedCommon) {
      return res.recordNotFound({
        message: "Record Not found!",
      });
    }
    return res.success({ message: "data has been updated.", data: updatedCommon });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : delete Common in mongodb collection.
 * @param {Object} res : response of Common
 * @fields : CommonId in params
 * @return {Object} : Common. {status, message, data}
 */
const deleteCommon = async (req, res) => {
  try {
    const findData = await dbService.findOne(Common, { _id: req.params.id });

    if (!findData) {
      return res.recordNotFound({
        data: findData,
        message: "record not found!",
      });
    }

    await dbService.deleteOne(Common, { _id: req.params.id });

    return res.success({ message: "Common deleted successfully." });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};



module.exports = {
  addCommon,
  getCommon,
  getAllCommon,
  updateCommon,
  deleteCommon,
};
