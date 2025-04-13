import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  healthData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthData',
    required: true
  },
  results: {
    heartDisease: {
      risk: {
        type: String,
        enum: ['low', 'moderate', 'high', 'very_high'],
        required: true
      },
      probability: {
        type: Number,
        required: true,
        min: 0,
        max: 1
      },
      factors: [String]
    },
    diabetes: {
      risk: {
        type: String,
        enum: ['low', 'moderate', 'high', 'very_high'],
        required: true
      },
      probability: {
        type: Number,
        required: true,
        min: 0,
        max: 1
      },
      factors: [String]
    },
    stroke: {
      risk: {
        type: String,
        enum: ['low', 'moderate', 'high', 'very_high'],
        required: true
      },
      probability: {
        type: Number,
        required: true,
        min: 0,
        max: 1
      },
      factors: [String]
    }
  },
  recommendations: {
    lifestyle: [String],
    diet: [String],
    activity: [String],
    medical: [String]
  },
  model: {
    version: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    accuracy: {
      type: Number,
      min: 0,
      max: 1
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index to find the latest prediction for a user
predictionSchema.index({ user: 1, createdAt: -1 });

const Prediction = mongoose.model('Prediction', predictionSchema);

export default Prediction; 