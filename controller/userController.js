const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../model/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appErrors");
const sharp = require("sharp");
const factory = require("./handlerFunction");
const multer = require("multer");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("not an image!! please upload an image", 400));
  }
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({
  storage,
  fileFilter: multerFilter,
});
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
exports.uploadUserPhoto = upload.single("photo");
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});
exports.getme = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.resizeUserImage = catchAsync(async (req, res, next) => {
  // Call the upload middleware to handle file upload
  upload.single("photo")(req, res, async (err) => {
    if (err) {
      return next(new AppError("Failed to upload image.", 400));
    }

    // Check if req.file exists
    if (!req.file) {
      return next();
    }

    const fileToProcess = req.file;

    const resizedImagePath = `./public/temp/${fileToProcess.filename}-resized.jpeg`;

    // Resize and upload the image
    await sharp(fileToProcess.path)
      .resize({ width: 474, height: 497 })
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(resizedImagePath);

    try {
      const result = await cloudinary.uploader.upload(resizedImagePath, {
        resource_type: "auto",
      });
      console.log(result.secure_url);

      // Store the URL based on the file type
      req.body.photo = result.secure_url;
      console.log("Cloudinary URL for user:", result.secure_url);

      // Call next middleware
      next();
    } catch (err) {
      return next();
    }
  });
});
exports.getdetails = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    res.status(200).json({
      status: "fail",
      user: "no user",
    });
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const freshUser = await User.findById(decoded.id).populate("products");

  res.status(200).json({
    status: "success",
    user: freshUser,
  });
});

exports.getalluser = catchAsync(async (req, res, next) => {
  const doc = await User.find().populate("products");

  if (!doc) {
    return next(new AppError("sorry there are no user for ur website", 404));
  }

  res.status(200).json({
    status: "success",
    users: {
      data: doc,
    },
  });
});

const filterObj = (obj, ...AllowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (AllowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};
exports.updateme = catchAsync(async (req, res, next) => {
  //for getting the mime type for the multer middleware
  console.log(req.file);
  console.log(JSON.stringify(req.body));

  //1) creating the useer posts password data and it can not be updated here

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "do not insert the password here this is not the correct route please go on updatePassword route !! Thankuuuuuu",
        400
      )
    );
  }

  //2) updating the userdocument here
  const filterObject = filterObj(req.body, "name", "email");
  if (req.file) filterObject.photo = req.body.photo;

  const updateUser = await User.findByIdAndUpdate(req.user.id, filterObject, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      user: updateUser,
    },
  });
});

exports.getUser = factory.getOne(User);
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const doc = await User.find();

  if (!doc) {
    return next(new AppError("sorry there are no user for ur website", 404));
  }

  res.status(200).json({
    status: "success",
    users: {
      data: doc,
    },
  });
});

exports.deleteme = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
});
