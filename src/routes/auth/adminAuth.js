const express = require('express')
const adminAuthController = require('../../controller/admin/adminAuthController')
const { checkAuthenticate , checkRole} = require('../../middleware/adminAuthenticate')
const router = express.Router()

router.route('/signup').post(adminAuthController.signUp);
router.route('/login').post(adminAuthController.loginAdmin);
router.route('/setting').post(checkAuthenticate, checkRole('admin'), adminAuthController.setting);
router.route('/master/createadmin').post(checkAuthenticate, checkRole('master'), adminAuthController.createAdminByMaster);
router.route('/master/ban_user').put(checkAuthenticate, checkRole('master'), adminAuthController.banAdminOrUserByMaster);
router.route('/master/removeban').put(checkAuthenticate, checkRole('master'), adminAuthController.removeBanAdminOrUserByMaster);
router.route('/master/admin_list').get(checkAuthenticate, checkRole('master'), adminAuthController.viewAllAdminByMaster);
router.route('/master/update_admin/:id').put(checkAuthenticate, checkRole('master'), adminAuthController.updateAdminByMaster);
router.route('/master/delete_admin/:id').delete(checkAuthenticate, checkRole('master'), adminAuthController.deleteAdminByMaster);

module.exports = router
