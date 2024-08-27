const express = require("express")
const {Company, CompanyAccount } = require("../db");
const zod = require("zod")
const jwt = require("jsonwebtoken")
const JWT_SECRET = require("../config")
const {authMiddleware} = require("../middleware")

const router = express.Router()

const registerSchema = zod.object({
    companyName: zod.string(),
    password: zod.string(),
    noOfEmployees: zod.number(),
    electricityConsumptionPerPerson: zod.number(),
    fuelConsumptionPerPerson: zod.number(),
    transportationKmPerPerson: zod.number(),
    esgscore: zod.number(),
    controversyscore: zod.number().min(1).max(5),
    initialBalance: zod.number()
});

router.post("/register", async (req, res) => {
    const { success } = registerSchema.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        });
    }

    const existingCompany = await Company.findOne({
        companyName: req.body.companyName
    });
    if (existingCompany) {
        return res.status(411).json({
            message: "Company name already taken"
        });
    }

    try {
        const company = await Company.create({
            companyName: req.body.companyName,
            password: req.body.password,
            noOfEmployees: req.body.noOfEmployees,
            electricityConsumptionPerPerson: req.body.electricityConsumptionPerPerson,
            fuelConsumptionPerPerson: req.body.fuelConsumptionPerPerson,
            transportationKmPerPerson: req.body.transportationKmPerPerson,
            esgscore: req.body.esgscore,
            controversyscore: req.body.controversyscore
        });

        const companyId = company._id;

        function calculateCarbonFootprint(company) {
            const annualElectricity = company.noOfEmployees * company.electricityConsumptionPerPerson * 365; // kWh
            const annualFuel = company.noOfEmployees * company.fuelConsumptionPerPerson * 365; // liters
            const annualTransportation = company.noOfEmployees * company.transportationKmPerPerson * 365; // km
        
            const electricityFactor = 0.5; // kg CO2 per kWh
            const fuelFactor = 2.3; // kg CO2 per liter
            const transportationFactor = 0.14; // kg CO2 per km
        
            const carbonFootprint = 
                (annualElectricity * electricityFactor) +
                (annualFuel * fuelFactor) +
                (annualTransportation * transportationFactor);
        
            return -(carbonFootprint / 1000); // Convert to metric tons
        }

        const carbonCredits = calculateCarbonFootprint(company);

        await CompanyAccount.create({
            company: companyId,  
            carbonCredits: carbonCredits,
            Balance: req.body.initialBalance
        });

        const token = jwt.sign({
            companyId,
            userType: 'company'  
        }, JWT_SECRET);

        res.json({
            message: "Company registered successfully",
            token: token
        });
    } 
    catch (error) {
        console.error("Error in company registration:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

const signinSchema = zod.object({
    companyName: zod.string(),
    password: zod.string()
});

router.post("/sign-in", async (req, res) => {
    const { success } = signinSchema.safeParse(req.body);

    if (!success) {
        return res.status(411).json({
            message: "Invalid input"
        });
    }

    try {
        const company = await Company.findOne({
            companyName: req.body.companyName,
            password: req.body.password
        });

        if (!company) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const companyId = company._id;

        const token = jwt.sign({
            companyId,
            userType: 'company'  
        }, JWT_SECRET);

        res.json({
            message: "Sign-in successful",
            token: token
        });

    } 
    catch (error) {
        console.error("Error in company sign-in:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});


const updateSchema = zod.object({
    password: zod.string().optional(),
    noOfEmployees: zod.number().optional(),
    electricityConsumptionPerPerson: zod.number().optional(),
    fuelConsumptionPerPerson: zod.number().optional(),
    transportationKmPerPerson: zod.number().optional(),
    initialBalance: zod.number().optional(),
    esgscore: zod.number().optional(),
    controversyscore: zod.number().min(1).max(5).optional()
});

router.put("/", authMiddleware, async (req, res) => {
    const { success } = updateSchema.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            message: "Invalid input for update"
        });
    }

    try {
        const updatedCompany = await Company.findByIdAndUpdate(
            req.companyId,
            {
                $set: {
                    password: req.body.password,
                    noOfEmployees: req.body.noOfEmployees,
                    electricityConsumptionPerPerson: req.body.electricityConsumptionPerPerson,
                    fuelConsumptionPerPerson: req.body.fuelConsumptionPerPerson,
                    transportationKmPerPerson: req.body.transportationKmPerPerson,
                    esgscore: req.body.esgscore,
                    controversyscore: req.body.controversyscore
                }
            },
            { new: true, runValidators: true }
        );

        if (!updatedCompany) {
            return res.status(404).json({
                message: "Company not found"
            });
        }

        if (req.body.noOfEmployees || 
            req.body.electricityConsumptionPerPerson || 
            req.body.fuelConsumptionPerPerson || 
            req.body.transportationKmPerPerson ||
            req.body.esgscore) {
            
            const newCarbonCredits = calculateCarbonFootprint(updatedCompany);
            
            await CompanyAccount.findOneAndUpdate(
                { company: req.companyId },
                { $set: { carbonCredits: newCarbonCredits } }
            );
        }

        if (req.body.initialBalance !== undefined) {
            await CompanyAccount.findOneAndUpdate(
                { company: req.companyId },
                { $set: { Balance: req.body.initialBalance } }
            );
        }

        res.json({
            message: "Updated successfully",
            updatedCompany
        });
    } 
    catch (error) {
        console.error("Error in company update:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});


router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";
    try {
        const companies = await Company.find({
            companyName: {
                "$regex": filter,
                "$options": "i"  // Case-insensitive search
            }
        });

        const companyIds = companies.map(company => company._id);

        const companyAccounts = await CompanyAccount.find({
            company: { $in: companyIds }
        });

        const companyData = companies.map(company => {
            const account = companyAccounts.find(acc => acc.company.toString() === company._id.toString());
            return {
                companyName: company.companyName,
                carbonCredits: account ? account.carbonCredits : 0
            };
        });

        res.json({
            companies: companyData
        });
    } 
    catch (error) {
        console.error("Error in /bulk route:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/mldata", authMiddleware, async (req, res) => {
    try {
        const company = await Company.findById(req.companyId);
        if (!company) {
            return res.status(404).json({
                message: "Company not found"
            });
        }

        res.json({
            esgScore: company.esgscore,
            controversyScore: company.controversyScore 
        });
    } catch (error) {
        console.error("Error fetching ML data:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});



module.exports = router;
