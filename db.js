const mongoose = require('mongoose');
const connectionString = 'mongodb+srv://maininaman77:Maini%40762002@cluster0.mu0sfjb.mongodb.net/CarbonCredit';

async function connectToDatabase() {
  try {
    await mongoose.connect(connectionString);
    console.log('Connected to MongoDB');
  } 
  catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

connectToDatabase();

const companySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    noOfEmployees: {
        type: Number,
        required: true,
        trim: true
    },
    electricityConsumptionPerPerson: {
        type: Number,
        required: true,
        trim: true
    }, // in kWh per person
    fuelConsumptionPerPerson: {
        type: Number,
        required: true,
        trim: true
    }, // in liters per person
    transportationKmPerPerson: {
        type: Number,
        required: true,
        trim: true
    }, // in km per person
    esgscore:{
        type: Number,
        required: true,
        trim: true
    },
    controversyscore:{
        type: Number,
        required: true,
        trim: true,
        min: 1,
        max: 5,
    }
});

const renewableProjectSchema = new mongoose.Schema({
    projectName: {
        type: String,
        required: true,
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    energyProduced: { 
        type: Number, 
        required: true 
    } // in kWh
});

const companyAccountSchema = new mongoose.Schema({
    company: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Company',
      required: true
    },
    carbonCredits: { 
        type: Number, 
        default: 0 
    },
    Balance: {
        type: Number,
        default: 0
    }
});

const projectAccountSchema = new mongoose.Schema({
    project: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'RenewableProject',
      required: true
    },
    carbonCredits: { 
        type: Number, 
        default: 0 
    },
    Balance: {
        type: Number,
        default: 0
    }
});

const Company = mongoose.model('Company', companySchema);
const RenewableProject = mongoose.model('RenewableProject', renewableProjectSchema);
const CompanyAccount = mongoose.model('CompanyAccount', companyAccountSchema);
const ProjectAccount = mongoose.model('ProjectAccount', projectAccountSchema);

module.exports = {
    Company,
    RenewableProject,
    CompanyAccount,
    ProjectAccount
};