/**
 * ContactController.js
 * @description :: API routes for ContactController.js
 */

const express = require("express");
const router = express.Router();
const {
  checkAuthenticate,
  checkRole,
} = require("../../../middleware/adminAuthenticate");
const contactController = require("../../../controller/contactController");

router
  .route("contact/create")
  .post(contactController.addContact);

router
  .route("contact/:id")
  .get(checkAuthenticate, checkRole('master','admin'), contactController.getContact);

router.route("contact/").get(checkAuthenticate, checkRole('master','admin'), contactController.getAllContact);

router
  .route("contact/:id").delete(checkAuthenticate, checkRole('master','admin'), contactController.deleteContact);

module.exports = router;
                                  