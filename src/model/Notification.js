/**
 * FirebaseNotification.js
 * @description :: model of a database collection Notification
 */

let mongoose = require("mongoose");

let idValidator = require("mongoose-id-validator");

const Schema = mongoose.Schema;

let schema = new Schema(
  {
     title : { type : String, trim: true }, 
     image : {type : String, trim: true  },
     msgbody : {type : String, trim: true },
     msgUrl : {type : String, trim: true },
  },
  {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
}
);

schema.method("toJSON", function () {
  const { _id, __v, ...object } = this.toObject({ virtuals: true });
  object.id = _id;
  delete object.password;

  return object;
});

schema.plugin(idValidator);

const schemaModel= mongoose.model("Notification", schema);
module.exports = schemaModel;
