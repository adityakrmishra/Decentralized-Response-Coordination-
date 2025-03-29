import mongoose from 'mongoose';
import { resourceStatus } from '../constants/resource.constants.js';

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  contact: {
    email: String,
    phone: String
  },
  address: {
    type: String
  },
  reliabilityRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 3
  }
}, { _id: false });

const deliveryTimelineSchema = new mongoose.Schema({
  dispatchedAt: Date,
  estimatedArrival: Date,
  actualArrival: Date,
  delays: [{
    reason: String,
    duration: Number, // minutes
    timestamp: Date
  }]
}, { _id: false });

const ResourceSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['medical', 'food', 'water', 'equipment', 'personnel', 'other']
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  currentLocation: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  destination: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  status: {
    type: String,
    enum: resourceStatus,
    default: 'available'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  supplier: supplierSchema,
  assignedDisaster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Disaster'
  },
  delivery: deliveryTimelineSchema,
  history: [{
    status: String,
    location: {
      type: {
        type: String,
        default: 'Point'
      },
      coordinates: [Number]
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  blockchainTxHash: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Geospatial indexes
ResourceSchema.index({ currentLocation: '2dsphere' });
ResourceSchema.index({ destination: '2dsphere' });

// Compound index for status and priority
ResourceSchema.index({ status: 1, priority: 1 });

// Virtual for distance calculation (in km)
ResourceSchema.virtual('distanceToDestination').get(function() {
  if (!this.currentLocation || !this.destination) return null;
  
  const R = 6371; // Earth radius in km
  const [lon1, lat1] = this.currentLocation.coordinates;
  const [lon2, lat2] = this.destination.coordinates;
  
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
});

export const Resource = mongoose.model('Resource', ResourceSchema);
