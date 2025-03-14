/**
 * AdminAuth.js
 * @description :: model of a database collection user
 */

const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const idValidator = require("mongoose-id-validator");
const { Schema } = mongoose;

const myCustomLabels = {
  totalDocs: "itemCount",
  docs: "data",
  limit: "perPage",
  page: "currentPage",
  nextPage: "next",
  prevPage: "prev",
  totalPages: "pageCount",
  pagingCounter: "slNo",
  meta: "paginator",
};

mongoosePaginate.paginate.options = { customLabels: myCustomLabels };

const schema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['privacy_policy', 'terms_of_use', 'about_us', 'grievance']
    },
    content: {
      type: String,
      required: true
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

schema.pre("save", async function (next) {
  this.isDeleted = false;
  this.isActive = true;
  next();
});

schema.pre("insertMany", async function (next, docs) {
  if (docs && docs.length) {
    for (let index = 0; index < docs.length; index++) {
      const element = docs[index];
      element.isDeleted = false;
      element.isActive = true;
    }
  }
  next();
});


schema.method("toJSON", function () {
  const { _id, __v, ...object } = this.toObject({ virtuals: true });
  object.id = _id;
  delete object.password;

  return object;
});

schema.plugin(mongoosePaginate);
schema.plugin(idValidator);

const Common = mongoose.model("Common", schema);
module.exports = Common;
