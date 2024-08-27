const express = require('express');
const { authMiddleware } = require('../middleware');
const { ProjectAccount } = require('../db');

const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
    const account = await ProjectAccount.findOne({
        userId: req.userId
    });

    res.json({
        carbonCredits: account.carbonCredits,
        balance: account.Balance
    })
});

module.exports = router;