const express = require("express");
const multer = require("multer");
const tourController = require("../controller/tourController");

const upload = multer({ dest: "uploads/" });

const router = express.Router();

router
  .route("/")
  .post(upload.single("imageCover"), tourController.createTour)
  .get(tourController.getAllTours);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(upload.single("imageCover"), tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
