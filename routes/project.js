const express = require("express");
const { RenewableProject, ProjectAccount } = require("../db");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config");
const { authMiddleware } = require("../middleware");

const router = express.Router();

const projectSchema = zod.object({
    projectName: zod.string(),
    password: zod.string(),
    energyProduced: zod.number(),
    initialBalance: zod.number().optional()
});

router.post("/register", async (req, res) => {
    const { success } = projectSchema.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        });
    }

    const existingProject = await RenewableProject.findOne({
        projectName: req.body.projectName
    });

    if (existingProject) {
        return res.status(411).json({
            message: "Project name already taken"
        });
    }
    
    try {
        const project = await RenewableProject.create({
            projectName: req.body.projectName,
            password: req.body.password,
            energyProduced: req.body.energyProduced
        });
    
        const projectId = project._id;
    
        function calculateCarbonCredits(project) {
            const annualEnergy = project.energyProduced * 365; // kWh per year
            const averageGridIntensity = 0.5; // kg CO2 per kWh
            const carbonSaved = annualEnergy * averageGridIntensity;
            return carbonSaved / 1000; // Convert to metric tons
        }
    
        const carbonCredits = calculateCarbonCredits(project);
    
        await ProjectAccount.create({
            project: projectId,  
            carbonCredits: carbonCredits,
            balance: req.body.initialBalance || 0
        });
    
        const token = jwt.sign({
            projectId,
            userType: 'project' 
        }, JWT_SECRET);
    
        res.json({
            message: "Renewable project registered successfully",
            token: token
        });
    } 
    catch (error) {
        console.error("Error in renewable project registration:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

const signinSchema = zod.object({
    projectName: zod.string(),
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
        const project = await RenewableProject.findOne({
            projectName: req.body.projectName,
            password: req.body.password
        });

        if (!project) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const projectId = project._id;

        const token = jwt.sign({
            projectId,
            userType: 'project'
        }, JWT_SECRET);

        res.json({
            message: "Sign-in successful",
            token: token
        });

    } 
    catch (error) {
        console.error("Error in project sign-in:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

const updateSchema = zod.object({
    password: zod.string().optional(),
    energyProduced: zod.number().optional()
});

router.put("/", authMiddleware, async (req, res) => {
    const { success } = updateSchema.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            message: "Invalid input for update"
        });
    }

    try {
        const updatedProject = await RenewableProject.findByIdAndUpdate(
            req.projectId,
            {
                $set: {
                    password: req.body.password,
                    energyProduced: req.body.energyProduced
                }
            },
            { new: true, runValidators: true }
        );

        if (!updatedProject) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        if (req.body.energyProduced) {
            const newCarbonCredits = calculateCarbonCredits(updatedProject);
            
            await ProjectAccount.findOneAndUpdate(
                { project: req.projectId },
                { $set: { carbonCredits: newCarbonCredits } }
            );
        }

        res.json({
            message: "Updated successfully",
            updatedProject
        });
    } 
    catch (error) {
        console.error("Error in project update:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";
    try {
        const projects = await RenewableProject.find({
            projectName: {
                "$regex": filter,
                "$options": "i"  // Case-insensitive search
            }
        });

        const projectIds = projects.map(project => project._id);

        const projectAccounts = await ProjectAccount.find({
            project: { $in: projectIds }
        });

        const projectData = projects.map(project => {
            const account = projectAccounts.find(acc => acc.project.toString() === project._id.toString());
            return {
                projectName: project.projectName,
                carbonCredits: account ? account.carbonCredits : 0
            };
        });

        res.json({
            projects: projectData
        });
    } 
    catch (error) {
        console.error("Error in /bulk route:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
