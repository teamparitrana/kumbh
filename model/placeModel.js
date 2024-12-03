const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A place must have a name"],
    unique: true,
    trim: true,
  },
  summary: {
    type: String,
    required: [true, "A place must have a summary"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "A place must have a description"],
    trim: true,
  },
  location: {
    type: { type: String, default: "Point", enum: ["Point"] },
    coordinates: [Number],
    address: String,
    description: String,
  },
  imageCover: {
    type: String,
    required: [true, "A place must have a cover image"],
  },
  images: [String],
  category: {
    type: String,
    enum: ["trekking", "religious", "nature", "historic", "others"],
    required: [true, "A place must have a category"],
  },
});

placeSchema.index({ location: "2dsphere" }); // Geospatial index for location-based queries

const Place = mongoose.model("Place", placeSchema);

module.exports = Place;
