const mongoose = require("mongoose");

const clickSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    ip:        { type: String, default: "unknown" },
    country:   { type: String, default: "Unknown" },
    city:      { type: String, default: "Unknown" },
    userAgent: { type: String, default: "" },
    referrer:  { type: String, default: "" },
  },
  { _id: false }
);

const urlSchema = new mongoose.Schema(
  {
    originalUrl: { type: String, required: true, trim: true },
    shortCode: {
      type: String, required: true, unique: true, index: true, trim: true,
    },
    alias:     { type: String, default: null, trim: true },
    expiresAt: {
      type: Date, default: null,
      index: { expireAfterSeconds: 0, partialFilterExpression: { expiresAt: { $ne: null } } },
    },
    isActive:    { type: Boolean, default: true },
    clicks:      { type: [clickSchema], default: [] },
    totalClicks: { type: Number, default: 0 },
    qrCode:      { type: String, default: null },
    createdBy:   { type: String, default: null }, // creator IP

    // Passwordless ownership token — a secret UUID given to the creator
    manageToken: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

urlSchema.virtual("shortUrl").get(function () {
  return `${process.env.BASE_URL}/${this.shortCode}`;
});

urlSchema.virtual("isExpired").get(function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

urlSchema.index({ createdAt: -1 });
urlSchema.index({ shortCode: 1, isActive: 1 });
urlSchema.index({ manageToken: 1, createdAt: -1 });

module.exports = mongoose.model("Url", urlSchema);
