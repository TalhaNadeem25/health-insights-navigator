import mongoose from 'mongoose';

const healthDataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Basic health metrics
  age: {
    type: Number,
    required: true,
    min: 18,
    max: 120
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    required: true
  },
  height: {
    type: Number,
    required: true,
    min: 50, // cm
    max: 250 // cm
  },
  weight: {
    type: Number,
    required: true,
    min: 20, // kg
    max: 500 // kg
  },
  bmi: {
    type: Number,
    required: true
  },
  bloodPressure: {
    systolic: {
      type: Number,
      required: true,
      min: 70,
      max: 250
    },
    diastolic: {
      type: Number,
      required: true,
      min: 40,
      max: 150
    }
  },
  
  // Lifestyle factors
  smokingStatus: {
    type: String,
    enum: ['never', 'former', 'current', 'unknown'],
    required: true
  },
  physicalActivity: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'vigorous', 'unknown'],
    required: true
  },
  alcoholConsumption: {
    type: String,
    enum: ['none', 'light', 'moderate', 'heavy', 'unknown'],
    default: 'unknown'
  },
  diet: {
    type: String,
    enum: ['balanced', 'vegetarian', 'vegan', 'keto', 'low_carb', 'high_protein', 'mediterranean', 'poor', 'unknown'],
    required: true
  },
  
  // Medical history
  familyHistory: {
    diabetes: {
      type: Boolean,
      default: false
    },
    heartDisease: {
      type: Boolean,
      default: false
    },
    stroke: {
      type: Boolean,
      default: false
    },
    cancer: {
      type: Boolean,
      default: false
    },
    hypertension: {
      type: Boolean,
      default: false
    }
  },
  
  // Lab values (if available)
  labResults: {
    glucoseLevels: {
      type: Number,
      min: 50,
      max: 500
    },
    cholesterol: {
      total: {
        type: Number,
        min: 50,
        max: 500
      },
      hdl: {
        type: Number,
        min: 10,
        max: 100
      },
      ldl: {
        type: Number,
        min: 30,
        max: 300
      },
      triglycerides: {
        type: Number,
        min: 50,
        max: 1000
      }
    },
    hba1c: {
      type: Number,
      min: 3,
      max: 15
    }
  },
  
  // Free-form health report
  freeFormReport: {
    type: String,
    maxlength: 5000
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Pre-save hook to calculate BMI if height and weight are provided but BMI is not
healthDataSchema.pre('save', function(next) {
  if (this.height && this.weight && !this.bmi) {
    // Formula: BMI = weight(kg) / (height(m))²
    const heightInMeters = this.height / 100; // Convert cm to meters
    this.bmi = parseFloat((this.weight / (heightInMeters * heightInMeters)).toFixed(1));
  }
  next();
});

// Method to check if the data is complete enough for prediction
healthDataSchema.methods.isCompleteForPrediction = function() {
  // Basic requirements for prediction
  return (
    this.age !== undefined &&
    this.gender !== undefined &&
    this.height !== undefined &&
    this.weight !== undefined &&
    this.bmi !== undefined &&
    this.bloodPressure !== undefined &&
    this.bloodPressure.systolic !== undefined &&
    this.bloodPressure.diastolic !== undefined &&
    this.smokingStatus !== undefined &&
    this.physicalActivity !== undefined
  );
};

const HealthData = mongoose.model('HealthData', healthDataSchema);

export default HealthData; 