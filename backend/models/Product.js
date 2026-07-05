const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productCode: { type: String, unique: true, required: true, trim: true },
  productName: { type: String, required: true, trim: true },
  tp: { type: Number, required: true, min: 0 }, // Trade Price (For Dealers)
  mrp: { type: Number, required: true, min: 0 }, // Maximum Retail Price (For General Customers)
  stockQuantity: { type: Number, required: true, default: 0, min: 0 }
}, { timestamps: true });

productSchema.pre('validate', function() {
  if (this.productCode) {
    this.productCode = this.productCode.toUpperCase().trim();
  }
});

module.exports = mongoose.model('Product', productSchema);
