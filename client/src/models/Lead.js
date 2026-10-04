const mongoose = require('mongoose');

const { BUSINESS_TYPES, PARTNERSHIP_NEEDS, LEAD_STATUSES } = require('../lib/leadOptions');

const leadSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    businessType: {
      type: String,
      required: true,
      enum: BUSINESS_TYPES,
    },
    partnershipNeed: {
      type: [{ type: String, enum: PARTNERSHIP_NEEDS }],
      required: true,
    },
    dailyFootfall: {
      // Field 6: estimated daily footfall / existing dairy brands handled
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: 'new',
    },
    notes: {
      type: String,
      default: '',
    },
    sheetSynced: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Lead = mongoose.models.Lead || mongoose.model('Lead', leadSchema);

module.exports = Lead;
module.exports.BUSINESS_TYPES = BUSINESS_TYPES;
module.exports.PARTNERSHIP_NEEDS = PARTNERSHIP_NEEDS;
module.exports.LEAD_STATUSES = LEAD_STATUSES;
