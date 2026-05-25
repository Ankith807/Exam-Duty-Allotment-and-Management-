const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const userController = require('../controllers/userController');
const profilepicController= require('../controllers/profilepic')
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.put('/:id/role', userController.updateUserRole);
router.get("/availability/:userId",userController.getAvailabilityByUserId );
router.get("/eligible-users",userController.getEligibleUsersByExamT)
router.get('/test', (req, res) => {
    console.log("Test route hit");
    res.send("Test OK");
  });

router.put(
  '/user/:id/profile-picture',
  upload.single('profile_pic'), 
  profilepicController.updateProfilePicture
);

router.get('/user/:id/profile-picture',profilepicController.getProfilepic)
  
module.exports = router;

