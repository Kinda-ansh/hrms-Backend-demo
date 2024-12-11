const express = require('express')
const faqController = require('../../../controller/faqController')
const { checkAuthenticate , checkRole} = require('../../../middleware/adminAuthenticate')
const router = express.Router()

router.route('faq/create').post(checkAuthenticate, checkRole('master','admin'), faqController.addFaq);
router.route('faq/:id').put(checkAuthenticate, checkRole('master','admin'), faqController.updateFaq);
router.route('faq/:id').delete(checkAuthenticate, checkRole('master','admin'), faqController.deleteFaq);
router.route('faq/:id').get(faqController.getFaq);
router.route('faq/').get(faqController.getAllFaq);

module.exports = router;