const mongoose = require("mongoose");
const slugify = require("slugify");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    summary: {
      type: String,
      required: [true, "A tour must have a summary"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    startLocation: {
      type: { type: String, default: "Point", enum: ["Point"] },
      coordinates: [Number],
      address: String,
      description: String,
    },
    places: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Place", // Reference to the Place model
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "places",
    select: "name summary location imageCover", // Fetch essential fields
  });
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
