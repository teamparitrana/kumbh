import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadoncloudinary = async (localfilepath) => {
  try {
    if (!localfilepath) return null;

    const res = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
    });

    console.log("file uploaded on cloudinary successfully", res.url);
    return res;
  } catch (error) {
    fs.unlinkSync(localfilepath); //remove the locally saved tempeorary file as the upload opertaion got fail
    return null;
  }
};
