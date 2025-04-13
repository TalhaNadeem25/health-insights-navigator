import express from 'express';
import HealthData from '../models/HealthData.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Middleware to protect all routes
router.use(authenticateUser);

// Create health data entry
router.post('/', async (req, res) => {
  try {
    const {
      age, gender, height, weight, bloodPressure,
      smokingStatus, physicalActivity, alcoholConsumption, diet,
      familyHistory, labResults, freeFormReport
    } = req.body;
    
    // Format blood pressure from string to object if needed
    let formattedBloodPressure = bloodPressure;
    if (typeof bloodPressure === 'string' && bloodPressure.includes('/')) {
      const [systolic, diastolic] = bloodPressure.split('/').map(num => parseInt(num.trim()));
      formattedBloodPressure = { systolic, diastolic };
    }
    
    // Create new health data
    const healthData = new HealthData({
      user: req.userId,
      age, 
      gender, 
      height, 
      weight, 
      bloodPressure: formattedBloodPressure,
      smokingStatus, 
      physicalActivity, 
      alcoholConsumption, 
      diet,
      familyHistory: familyHistory || {},
      labResults: labResults || {},
      freeFormReport
    });
    
    await healthData.save();
    
    res.status(201).json({
      message: 'Health data saved successfully',
      healthData: healthData
    });
  } catch (error) {
    console.error('Health data creation error:', error);
    res.status(500).json({ message: 'Server error saving health data', error: error.message });
  }
});

// Get all health data entries for a user
router.get('/', async (req, res) => {
  try {
    const healthData = await HealthData.find({ user: req.userId }).sort({ createdAt: -1 });
    
    res.json({
      count: healthData.length,
      healthData
    });
  } catch (error) {
    console.error('Health data fetch error:', error);
    res.status(500).json({ message: 'Server error fetching health data' });
  }
});

// Get latest health data entry for a user
router.get('/latest', async (req, res) => {
  try {
    const healthData = await HealthData.findOne({ user: req.userId }).sort({ createdAt: -1 });
    
    if (!healthData) {
      return res.status(404).json({ message: 'No health data found for this user' });
    }
    
    res.json({ healthData });
  } catch (error) {
    console.error('Latest health data fetch error:', error);
    res.status(500).json({ message: 'Server error fetching latest health data' });
  }
});

// Get specific health data entry
router.get('/:id', async (req, res) => {
  try {
    const healthData = await HealthData.findOne({
      _id: req.params.id,
      user: req.userId
    });
    
    if (!healthData) {
      return res.status(404).json({ message: 'Health data entry not found' });
    }
    
    res.json({ healthData });
  } catch (error) {
    console.error('Health data fetch error:', error);
    res.status(500).json({ message: 'Server error fetching health data' });
  }
});

// Update health data entry
router.put('/:id', async (req, res) => {
  try {
    const updates = {};
    
    // Only include fields that are provided
    const allowedFields = [
      'age', 'height', 'weight', 'bloodPressure',
      'smokingStatus', 'physicalActivity', 'alcoholConsumption', 'diet',
      'familyHistory', 'labResults', 'freeFormReport'
    ];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    // Format blood pressure from string to object if needed
    if (typeof updates.bloodPressure === 'string' && updates.bloodPressure.includes('/')) {
      const [systolic, diastolic] = updates.bloodPressure.split('/').map(num => parseInt(num.trim()));
      updates.bloodPressure = { systolic, diastolic };
    }
    
    const healthData = await HealthData.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      updates,
      { new: true, runValidators: true }
    );
    
    if (!healthData) {
      return res.status(404).json({ message: 'Health data entry not found' });
    }
    
    res.json({
      message: 'Health data updated successfully',
      healthData
    });
  } catch (error) {
    console.error('Health data update error:', error);
    res.status(500).json({ message: 'Server error updating health data' });
  }
});

// Delete health data entry
router.delete('/:id', async (req, res) => {
  try {
    const healthData = await HealthData.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });
    
    if (!healthData) {
      return res.status(404).json({ message: 'Health data entry not found' });
    }
    
    res.json({ message: 'Health data deleted successfully' });
  } catch (error) {
    console.error('Health data deletion error:', error);
    res.status(500).json({ message: 'Server error deleting health data' });
  }
});

export default router; 