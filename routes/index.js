var express = require('express');
var router = express.Router();

/*product page. */
router.use('/brand',require('./brands'));
router.use('/type',require('./types'));
router.use('/product',require('./products'));
router.use('/position',require('./positions'));
router.use('/employee',require('./employees'));
module.exports = router;
