const express = require('express')
const commonController = require('../../../controller/commonController')
const { checkAuthenticate , checkRole} = require('../../../middleware/adminAuthenticate')
const router = express.Router()

router.route('common/create').post(checkAuthenticate, checkRole('master','admin'), commonController.addCommon);
router.route('common/:id').put(checkAuthenticate, checkRole('master','admin'), commonController.updateCommon);
router.route('common/:id').delete(checkAuthenticate, checkRole('master','admin'), commonController.deleteCommon);
router.route('common/:id').get(commonController.getCommon);
router.route('common/').get(commonController.getAllCommon);

module.exports = router;