// Option lists for the B2B form, worded exactly as in the scope document
// (section 5.2). Shared by the form, the Lead model/API and the admin panel.
// CommonJS so the Mongoose model and Node scripts can require it too.

const BUSINESS_TYPES = [
  'Departmental Store / Supermart',
  'Kirana / Grocery',
  'Cafe / Restaurant',
  'Bakery',
  'School / College Canteen',
  'Other',
];

const PARTNERSHIP_NEEDS = [
  'Need a Company Deep Freezer',
  'Already have our own freezer - Ready to stock',
  'Interested in Tub Box Bulk Supply for Food Service',
];

const LEAD_STATUSES = ['new', 'contacted', 'converted', 'rejected'];

module.exports = { BUSINESS_TYPES, PARTNERSHIP_NEEDS, LEAD_STATUSES };
