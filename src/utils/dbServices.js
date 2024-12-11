// for create one as well as create many
const create = (model, data) =>
  new Promise((resolve, reject) => {
    model
      .create(data)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => reject(error));
  });

const insertMany = (model, data, options = { ordered: true }) =>
  new Promise((resolve, reject) => {
    model
      .insertMany(data, options)
      .then((result) => resolve(result))
      .catch((error) => reject(error));
  });

// update single document that will return updated document
const updateOne = (model, filter, data, options = { new: true }) =>
  new Promise((resolve, reject) => {
    model
      .findOneAndUpdate(filter, data, options)
      .then((result) => resolve(result))
      .catch((error) => reject(error));
  });

// delete single document that will return updated document
const deleteOne = (model, filter, options = { new: true }) =>
  new Promise((resolve, reject) => {
    model
      .findOneAndDelete(filter, options)
      .then((result) => resolve(result))
      .catch((error) => reject(error));
  });

// update multiple documents and returns count
const updateMany = (model, filter, data) =>
  new Promise((resolve, reject) => {
    model
      .updateMany(filter, data)
      .then((result) => resolve(result))
      .catch((error) => reject(error));
  });

// delete multiple documents and returns count
const deleteMany = (model, filter) =>
  new Promise((resolve, reject) => {
    model
      .deleteMany(filter)
      .then((result) => resolve(result))
      .catch((error) => reject(error));
  });

// find single document by query
const findOne = (model, filter, options) =>
  new Promise((resolve, reject) => {
    model
      .findOne(filter, options)
      .then((result) => resolve(result))
      .catch((error) => reject(error));
  });

// find single document by query
const bulkCreate = (model, filter, options) =>
  new Promise((resolve, reject) => {
    model
      .bulkCreate(filter, options)
      .then((result) => resolve(result))
      .catch((error) => reject(error));
  });



// find multiple documents
const findMany = (model, filter, options = {}) =>
  new Promise((resolve, reject) => {
    model
      .find(filter, options)
      .then((result) => resolve(result))
      .catch((error) => reject(error));
  });

// count documents
const count = (model, filter) =>
  new Promise((resolve, reject) => {
    model
      .countDocuments(filter)
      .then((result) => resolve(result))
      .catch((error) => reject(error));
  });

// find documents with pagination
const paginate = (model, filter, options) =>
  new Promise((resolve, reject) => {
    model
      .paginate(filter, options)
      .then((result) => resolve(result))
      .catch((error) => reject(error));
  });



module.exports = {
  create,
  insertMany,
  updateOne,
  updateMany,
  deleteOne,
  deleteMany,
  findOne,
  findMany,
  bulkCreate,
  count,
  paginate,

};
