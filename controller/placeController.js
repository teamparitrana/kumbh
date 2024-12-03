const Place = require("../model/placeModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appErrors");
const multer = require("multer");
const sharp = require("sharp");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload an image.", 400));
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: multerFilter,
});
exports.uploadImage = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);
exports.resizeAndUploadImage = catchAsync(async (req, res, next) => {
  if (!req.files) return next();

  if (req.files.imageCover) {
    const imagePath = req.files.imageCover[0].path;
    const resizedImagePath = `./public/temp/${Date.now()}-resized.jpeg`;

    await sharp(imagePath)
      .resize({ width: 600, height: 400 })
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(resizedImagePath);

    const result = await cloudinary.uploader.upload(resizedImagePath, {
      resource_type: "image",
    });

    req.body.imageCover = result.secure_url;
  }

  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (file) => {
        const resizedImagePath = `./public/temp/${Date.now()}-resized.jpeg`;

        await sharp(file.path)
          .resize({ width: 600, height: 400 })
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(resizedImagePath);

        const result = await cloudinary.uploader.upload(resizedImagePath, {
          resource_type: "image",
        });

        req.body.images.push(result.secure_url);
      })
    );
  }

  next();
});

exports.getAllPlaces = catchAsync(async (req, res, next) => {
  const places = await Place.find();

  if (!places || places.length === 0) {
    return next(new AppError("No places found.", 404));
  }

  res.status(200).json({
    status: "success",
    results: places.length,
    data: { places },
  });
});

exports.getPlace = catchAsync(async (req, res, next) => {
  const place = await Place.findById(req.params.id);

  if (!place) {
    return next(new AppError("Place not found.", 404));
  }

  res.status(200).json({
    status: "success",
    data: { place },
  });
});

exports.createPlace = catchAsync(async (req, res, next) => {
  const place = await Place.create(req.body);

  res.status(201).json({
    status: "success",
    data: { place },
  });
});

exports.updatePlace = catchAsync(async (req, res, next) => {
  const place = await Place.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!place) {
    return next(new AppError("Place not found.", 404));
  }

  res.status(200).json({
    status: "success",
    data: { place },
  });
});

exports.deletePlace = catchAsync(async (req, res, next) => {
  const place = await Place.findByIdAndDelete(req.params.id);

  if (!place) {
    return next(new AppError("Place not found.", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
