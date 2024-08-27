const express = require('express');
const { authMiddleware } = require('../middleware');
const { CompanyAccount } = require('../db');
const { ProjectAccount } = require('../db');
const { default: mongoose } = require('mongoose');

const router = express.Router();

router.post("/purchase-credits", authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { carbonCredits, projectId } = req.body;
        const creditPrice = 4; // 1 carbon credit = 4 dollars
        const totalCost = carbonCredits * creditPrice;

        // Fetch the accounts within the transaction
        const companyAccount = await CompanyAccount.findOne({ company: req.companyId }).session(session);
        const projectAccount = await ProjectAccount.findOne({ project: projectId }).session(session);

        if (!companyAccount || !projectAccount) {
            await session.abortTransaction();
            return res.status(400).json({
                message: "Invalid company or project account"
            });
        }

        if (companyAccount.Balance < totalCost) {
            await session.abortTransaction();
            return res.status(400).json({
                message: "Insufficient balance"
            });
        }

        if (projectAccount.carbonCredits < carbonCredits) {
            await session.abortTransaction();
            return res.status(400).json({
                message: "Insufficient carbon credits in project account"
            });
        }

        // Perform the transaction
        await CompanyAccount.updateOne(
            { company: req.companyId },
            { 
                $inc: { 
                    Balance: -totalCost,
                    carbonCredits: carbonCredits
                }
            }
        ).session(session);

        await ProjectAccount.updateOne(
            { project: projectId },
            { 
                $inc: { 
                    Balance: totalCost,
                    carbonCredits: -carbonCredits
                }
            }
        ).session(session);

        // Commit the transaction
        await session.commitTransaction();

        res.json({
            message: "Carbon credits purchased successfully",
            creditsPurchased: carbonCredits,
            totalCost: totalCost
        });
    } catch (error) {
        await session.abortTransaction();
        console.error("Error in carbon credits purchase:", error);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        session.endSession();
    }
});

module.exports = router;

