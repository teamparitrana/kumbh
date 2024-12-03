const Tour = require("../model/tourModel");
const cloudinary = require("cloudinary").v2;
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.createTour = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Cover image is required for the tour", 400));
  }

  const coverImage = await cloudinary.uploader.upload(req.file.path, {
    folder: "tour-covers",
    public_id: `tour-${Date.now()}`,
  });

  req.body.imageCover = coverImage.secure_url;

  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      tour: newTour,
    },
  });
});

exports.getAllTours = catchAsync(async (req, res, next) => {
  const tours = await Tour.find().populate(
    "places",
    "name summary location imageCover"
  );

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate(
    "places",
    "name summary location imageCover"
  );

  if (!tour) {
    return next(new AppError("No tour found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError("No tour found with that ID", 404));
  }

  if (req.file) {
    const coverImage = await cloudinary.uploader.upload(req.file.path, {
      folder: "tour-covers",
      public_id: `tour-${Date.now()}`,
    });
    req.body.imageCover = coverImage.secure_url;
  }

  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      tour: updatedTour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError("No tour found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
