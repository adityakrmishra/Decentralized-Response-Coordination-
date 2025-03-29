import mongoose from 'mongoose';
import { disasterTypes, statusTypes } from '../constants/disaster.constants.js';

const affectedAreaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  population: {
    type: Number,
    min: 0
  },
  infrastructureDamage: {
    type: String,
    enum: ['minor', 'moderate', 'severe']
  },
  coordinates: {
    type: [Number],  // [longitude, latitude]
    index: '2dsphere'
  }
}, { _id: false });

const resourceRequirementSchema = new mongoose.Schema({
  resourceType: {
    type: String,
    required: true,
    enum: ['medical', 'food', 'shelter', 'equipment', 'personnel']
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  }
}, { _id: false });

const DisasterSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: disasterTypes
  },
  severity: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],  // [longitude, latitude]
      required: true
    },
    radius: {
      type: Number,
      required: true,
      min: 100  // meters
    }
  },
  status: {
    type: String,
    enum: statusTypes,
    default: 'reported'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  affectedAreas: [affectedAreaSchema],
  resourcesAllocated: [resourceRequirementSchema],
  resolutionNotes: String,
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Geospatial index for location-based queries
DisasterSchema.index({ location: '2dsphere' });

// Text index for search
DisasterSchema.index({
  type: 'text',
  'affectedAreas.name': 'text',
  resolutionNotes: 'text'
});

// Virtual for formatted geojson
DisasterSchema.virtual('geoJSON').get(function() {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: this.location.coordinates
    },
    properties: {
      type: this.type,
      severity: this.severty,
      status: this.status
    }
  };
});

export const Disaster = mongoose.model('Disaster', DisasterSchema);
