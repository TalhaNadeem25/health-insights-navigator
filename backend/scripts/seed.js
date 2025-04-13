import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import HealthData from '../models/HealthData.js';
import Prediction from '../models/Prediction.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample user data
const users = [
  {
    email: 'demo@example.com',
    password: 'password123',
    firstName: 'Demo',
    lastName: 'User',
    role: 'user',
    dateOfBirth: new Date('1985-05-15'),
    gender: 'male'
  },
  {
    email: 'provider@example.com',
    password: 'password123',
    firstName: 'Health',
    lastName: 'Provider',
    role: 'healthcare_provider',
    dateOfBirth: new Date('1975-10-20'),
    gender: 'female'
  }
];

// Sample health data
const healthDataSamples = [
  {
    age: 45,
    gender: 'male',
    height: 175, // cm
    weight: 85, // kg
    bloodPressure: {
      systolic: 130,
      diastolic: 85
    },
    smokingStatus: 'former',
    physicalActivity: 'light',
    alcoholConsumption: 'moderate',
    diet: 'average',
    familyHistory: {
      diabetes: true,
      heartDisease: false,
      cancer: false,
      stroke: true,
      hypertension: true
    },
    labResults: {
      glucoseLevels: 110,
      cholesterol: {
        total: 210,
        hdl: 45,
        ldl: 130,
        triglycerides: 150
      },
      hba1c: 5.9
    },
    freeFormReport: "Patient reports occasional chest discomfort after moderate physical activity. Family history of type 2 diabetes (mother) and hypertension (father). Has been trying to improve diet but struggles with consistency. Recent weight gain of 5kg over the past year."
  },
  {
    age: 35,
    gender: 'female',
    height: 165, // cm
    weight: 62, // kg
    bloodPressure: {
      systolic: 118,
      diastolic: 75
    },
    smokingStatus: 'never',
    physicalActivity: 'moderate',
    alcoholConsumption: 'occasional',
    diet: 'good',
    familyHistory: {
      diabetes: false,
      heartDisease: true,
      cancer: true,
      stroke: false,
      hypertension: false
    },
    labResults: {
      glucoseLevels: 88,
      cholesterol: {
        total: 180,
        hdl: 55,
        ldl: 110,
        triglycerides: 120
      },
      hba1c: 5.2
    },
    freeFormReport: "Patient exercises regularly (running 3x/week, yoga 2x/week). Father had early-onset heart disease (diagnosis at 45). Follows a primarily plant-based diet with occasional fish. Reports good sleep hygiene and stress management techniques."
  }
];

// Sample prediction data (we'll generate actual predictions in the seed script)
const predictionSamples = [
  {
    diabetesRisk: {
      score: 65,
      level: 'moderate'
    },
    heartDiseaseRisk: {
      score: 45,
      level: 'low'
    },
    keyFactors: [
      {
        factor: "Elevated fasting glucose (110 mg/dL)",
        impact: "high",
        modifiable: true
      },
      {
        factor: "Family history of diabetes",
        impact: "high",
        modifiable: false
      },
      {
        factor: "Overweight (BMI 27.8)",
        impact: "medium",
        modifiable: true
      }
    ],
    recommendations: [
      "Increase physical activity to at least 150 minutes of moderate-intensity exercise per week",
      "Adopt a low-glycemic diet with reduced carbohydrate intake",
      "Schedule regular glucose monitoring every 3-6 months"
    ],
    analysis: "Based on the provided health data, this individual has a moderate risk for developing type 2 diabetes in the next 10 years. The elevated fasting glucose level of 110 mg/dL places them in the prediabetic range, and combined with a family history of diabetes and a BMI of 27.8, these factors significantly increase risk. Recent weight gain is concerning and suggests potential insulin resistance developing. However, the person's relatively young age and previous smoking cessation are positive factors. Heart disease risk is lower but still requires attention due to elevated blood pressure readings and family history of hypertension.",
    modelInfo: {
      name: 'Google Gemini 1.5 Pro',
      version: '1.0',
      confidence: 0.85
    }
  },
  {
    diabetesRisk: {
      score: 25,
      level: 'low'
    },
    heartDiseaseRisk: {
      score: 30,
      level: 'low'
    },
    keyFactors: [
      {
        factor: "Family history of heart disease",
        impact: "medium",
        modifiable: false
      },
      {
        factor: "Normal weight (BMI 22.8)",
        impact: "low",
        modifiable: true
      },
      {
        factor: "Regular physical activity",
        impact: "low",
        modifiable: true
      }
    ],
    recommendations: [
      "Maintain current physical activity levels",
      "Consider preventative cardiology consult due to family history",
      "Continue heart-healthy diet rich in omega-3 fatty acids"
    ],
    analysis: "This individual displays a favorable health profile with low risk for both diabetes and heart disease in the next 10 years. Normal glucose levels, healthy BMI, good cholesterol profile, and regular exercise routine all contribute to their low risk assessment. The family history of heart disease warrants monitoring but is currently mitigated by excellent lifestyle choices. Blood pressure readings are within normal range, and no smoking history further reduces cardiovascular risks. Continued adherence to current lifestyle habits is recommended with regular preventative screenings.",
    modelInfo: {
      name: 'Google Gemini 1.5 Pro',
      version: '1.0',
      confidence: 0.88
    }
  }
];

// Seeding function
async function seedDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await HealthData.deleteMany({});
    await Prediction.deleteMany({});
    
    console.log('Database cleared');
    
    // Create users
    const createdUsers = [];
    for (const userData of users) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Create user
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`Created user: ${savedUser.email}`);
    }
    
    // Create health data entries
    const createdHealthData = [];
    for (let i = 0; i < healthDataSamples.length; i++) {
      const healthData = new HealthData({
        ...healthDataSamples[i],
        user: createdUsers[i]._id
      });
      
      const savedHealthData = await healthData.save();
      createdHealthData.push(savedHealthData);
      console.log(`Created health data for user: ${createdUsers[i].email}`);
    }
    
    // Create predictions
    for (let i = 0; i < predictionSamples.length; i++) {
      const prediction = new Prediction({
        ...predictionSamples[i],
        user: createdUsers[i]._id,
        healthData: createdHealthData[i]._id
      });
      
      const savedPrediction = await prediction.save();
      console.log(`Created prediction for user: ${createdUsers[i].email}`);
    }
    
    console.log('Seeding completed successfully');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close database connection
    mongoose.disconnect();
    console.log('Database connection closed');
  }
}

// Run seeding function
seedDatabase();

 