const express = require("express");
const placeController = require("../controller/placeController");

const router = express.Router();

router.post(
  "/upload",
  placeController.uploadImage,
  placeController.resizeAndUploadImage,
  placeController.createPlace
);

router
  .route("/")
  .get(placeController.getAllPlaces)
  .post(
    placeController.uploadImage,
    placeController.resizeAndUploadImage,
    placeController.createPlace
  );

router
  .route("/:id")
  .get(placeController.getPlace)
  .patch(
    placeController.uploadImage,
    placeController.resizeAndUploadImage,
    placeController.updatePlace
  )
  .delete(placeController.deletePlace);

module.exports = router;
