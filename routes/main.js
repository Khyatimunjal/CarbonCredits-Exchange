const express = require("express")
const companyRouter = require("./company")
const projectRouter = require("./project")
const companyaccountRouter = require("./companyaccount");
const projectaccountRouter = require("./projectaccount");
const transactionRouter = require("./transaction")

const router = express.Router()

router.use("/company",companyRouter)
router.use("/project",projectRouter)
router.use("/companyaccount", companyaccountRouter);
router.use("/projectaccount", projectaccountRouter);
router.use("/transaction",transactionRouter)

module.exports = router