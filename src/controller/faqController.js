/**
 * FaqController.js
 * Created API for Faq API
 */

const dbService = require("../utils/dbServices");
const Faq = require("../model/Faq");
const { FaqValidation } = require("../utils/validations/validation");

/**
 * @description : create document of Faq in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document.
 * @return {Object} : created Faq. {status, message, data}
 */
const addFaq = async (req, res) => {
  try {
    const { title, description } = req.body;

    if(!title && !description){
      return res.badRequest({message: "title and description os required"})
    }

     // Perform Joi validation
     const { error } = FaqValidation.validate({
      title,
      description
    });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Check if Faq with the same title already exists
    const findData = await dbService.findOne(Faq, { title: title });
    if (findData) {
      return res.badRequest({ message: "Faq with the same title already exists." });
    }

    const dataToCreate = {
      title: title,
      description: description,
    };

    // Create new Faq in the database
    const createdData = await dbService.create(Faq, dataToCreate);

    if (!createdData) {
      return res.badRequest({ message: "Failed to create Faq data." });
    }

    return res.success({
      data: createdData,
      message: "Faq created successfully.",
    });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : get Faq in mongodb collection.
 * @param {Object} res : response of Faq
 * @return {Object} : Single Faq Response. {status, message, data}
 */
const getFaq = async (req, res) => {
  try {
    const findData = await dbService.findOne(Faq, { _id: req.params.id });

    if (!findData) {
      return res.recordNotFound({ data: findData });
    }

    return res.success({ data: findData });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : get all Faq in mongodb collection.
 * @param {Object} res : response of all Faq
 * @return {Object} : all Faq. {status, message, data}
 */
const getAllFaq = async (req, res) => {
  try {

    const data = await Faq.find({})

    if (!data.length) {
      return res.recordNotFound({ data: data });
    }

    const totalFaq = await Faq.countDocuments({});

    const responseData = {
      TotalFaq: totalFaq,
      data,
    };

    return res.success({ data: responseData });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : updation of Faq in mongodb collection.
 * @param {Object} req : request including body for updated documents.
 * @param {Object} res : response of updated document
 * @return {Object} : updated Faq {status, message, data}
 */
const updateFaq = async (req, res) => {
  try {
    const { title, description } = req.body;

    const findData = await dbService.findOne(Faq, { _id: req.params.id });

    if (!findData) {
      return res.recordNotFound({ data: findData });
    }

     const { error } = FaqValidation.validate({
      title,
      description
    });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const dataToUpdate = {
      title: title,
      description: description,
    };

    const updatedFaq = await dbService.updateOne(
      Faq,
      { _id: req.params.id },
      dataToUpdate
    );

    if (!updatedFaq) {
      return res.recordNotFound({
        message: "Record Not found!",
      });
    }
    return res.success({ message: "data has been updated.", data: updatedFaq });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : delete Faq in mongodb collection.
 * @param {Object} res : response of Faq
 * @fields : FaqId in params
 * @return {Object} : Faq. {status, message, data}
 */
const deleteFaq = async (req, res) => {
  try {
    const findData = await dbService.findOne(Faq, { _id: req.params.id });

    if (!findData) {
      return res.recordNotFound({
        data: findData,
        message: "record not found!",
      });
    }

    await dbService.deleteOne(Faq, { _id: req.params.id });

    return res.success({ message: "Faq deleted successfully." });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};



module.exports = {
  addFaq,
  getFaq,
  getAllFaq,
  updateFaq,
  deleteFaq,
};
