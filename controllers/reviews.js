const Runningtrail = require('../models/runningtrail');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const runningtrail = await Runningtrail.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    runningtrail.reviews.push(review);
    await review.save();
    await runningtrail.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/runningtrails/${runningtrail._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Runningtrail.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/runningtrails/${id}`);
}
