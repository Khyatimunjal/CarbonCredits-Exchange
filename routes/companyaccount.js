const express = require('express');
const { authMiddleware } = require('../middleware');
const { CompanyAccount } = require('../db');
const { spawn } = require('child_process');
const path = require('path');
const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
    const account = await CompanyAccount.findOne({ userId: req.userId });
    res.json({ carbonCredits: account.carbonCredits, balance: account.Balance });
});

router.put("/update-credits", authMiddleware, async (req, res) => {
    const { esgScore, controversyScore } = req.body;

    const pythonProcess = spawn('python', [
        path.join(__dirname, '..', 'ml', 'esg_model.py'),
        esgScore.toString(),
        controversyScore.toString()
    ]);

    let output = '';

    pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
    });

    pythonProcess.on('close', async (code) => {
        if (code !== 0) {
            return res.status(500).json({ error: "Error calculating ESG percentile" });
        }

        const percentile = parseFloat(output);

        // Dynamic Carbon Credit Allocation
        let bonusCredits;
        if (percentile <= 10) {
            bonusCredits = 100;
        } else if (percentile <= 20) {
            bonusCredits = 90;
        } else if (percentile <= 30) {
            bonusCredits = 80;
        } else if (percentile <= 40) {
            bonusCredits = 70;
        } else if (percentile <= 50) {
            bonusCredits = 60;
        } else {
            bonusCredits = 0;
        }

        const account = await CompanyAccount.findOne({ userId: req.userId });
        const newCarbonCredits = account.carbonCredits + bonusCredits;

        await CompanyAccount.updateOne(
            { userId: req.userId },
            { $set: { carbonCredits: newCarbonCredits } }
        );

        res.json({
            message: bonusCredits > 0 ? "Carbon credits updated successfully" : "No bonus credits awarded",
            newCarbonCredits
        });
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });
});

module.exports = router;