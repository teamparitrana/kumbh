const Review = require("./../model/reviewModel");

const factory = require("./handlerFunction");

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.user) {
    req.body.user = req.user.id;
  }
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  next();
};
exports.getReviewForm = (req, res) => {
  res.status(200).render("reviewForm", {
    tourId: req.params.tourId,
    userId: req.user.id,
  });
};
exports.getallreview = async (req, res) => {
  try {
    const reviews = await Review.find();
    res.status(200).json({
      status: "success",
      results: reviews.length,
      data: {
        reviews,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getreview = factory.getOne(Review);

exports.createreview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);
