const express = require('express');
const router = express.Router();
const { getMyCode, listReferrals } = require('../controllers/referral.controller');
const { authenticate } = require('../middleware/auth');

// GET /api/referrals/my-code — Get referral code and stats
router.get('/my-code', authenticate, getMyCode);

// GET /api/referrals/list — List user's referrals
router.get('/list', authenticate, listReferrals);

module.exports = router;
