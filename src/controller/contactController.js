/**
 * contactController.js
 * Created API for Contact Us API
 */

const dbService = require("../utils/dbServices");
const Contact = require("../model/Contact");
const { ContactValidation } = require("../utils/validations/validation");

/**
 * @description : create document of Contact in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document.
 * @return {Object} : created Contact. {status, message, data}
 */


/**
 * 
 * @param {object} req 
 * @param {*} res 
 * @returns 
 */

const addContact = async (req, res) => {
  try {
    const {
      fullName,
      subject,     
      email,
      message
    } = req.body;

    // Perform Joi validation
    const { error } = ContactValidation.validate({
      fullName,
      // email,
      message,
      subject,
    });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const dataToCreate = {
      fullName : fullName,
      subject : subject,
      email : email,
      message : message,
      
    };

    const createdData = await dbService.create(Contact, dataToCreate);

    if (!createdData) {
      return res.status(404).json({ message: "data might not be created!" });
    }

    return res.status(201).json({
      data: createdData,
      message: "data created successfully.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


/**
 * @description : get Contact in mongodb collection.
 * @param {Object} res : response of Contact
 * @return {Object} : Single Contact Response. {status, message, data}
 */

const getContact = async (req, res) => {
  try {
    const findData = await dbService.findOne(Contact, { _id: req.params.id });

    if (!findData) {
      return res.recordNotFound({ data: findData });
    }

    let data = {
      Contact: findData,
    };

    return res.success({ data: data });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : get all Contact in mongodb collection.
 * @param {Object} res : response of all Contact
 * @return {Object} : all Contact. {status, message, data}
 */

const getAllContact = async (req, res) => {
  try {
      // Extract page and limit from query parameters, set default values if not provided
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
  
      const skip = (page - 1) * limit;

    const data = await Contact.find({ isDeleted: false }).sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    if (!data.length) {
      return res.recordNotFound({ data: data });
    }

    // Check if any Contact are not found
    if (!data) {
      return res.recordNotFound({ data: data });
    }
    const totalJobs = await Contact.countDocuments({ isDeleted: false });
    let Data = {
      TotalContact: data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalJobs / limit),
        totalItems: totalJobs,
        itemsPerPage: limit,
      }
    };
    return res.success({ data: Data });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};


/**
 * @description : delete Contact in mongodb collection.
 * @param {Object} res : response of Contact
 * @fields : ContactId in params
 * @return {Object} : Contact. {status, message, data}
 */

const deleteContact = async (req, res) => {
  try {
    // Find the Contact data by its ID
    const findData = await dbService.findOne(Contact, { _id: req.params.id });

    if (!findData) {
      return res.recordNotFound({
        data: findData,
        message: "record not found!",
      });
    }

    // Delete the Contact from the database
    await dbService.deleteOne(Contact, {
      _id: req.params.id,
    });

    return res.success({ message: "data deleted successfully." });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

module.exports = {
  addContact,
  getContact,
  getAllContact,
  deleteContact,
};
