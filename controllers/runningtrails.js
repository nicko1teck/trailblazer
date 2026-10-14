const Runningtrail = require('../models/runningtrail');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");


module.exports.index = async (req, res) => {
    const runningtrails = await Runningtrail.find({}).populate('popupText');
    res.render('runningtrails/index', { runningtrails })
}

module.exports.renderNewForm = (req, res) => {
    res.render('runningtrails/new');
}

module.exports.createRunningtrail = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.runningtrail.location,
        limit: 1
    }).send()
    const runningtrail = new Runningtrail(req.body.runningtrail);
    runningtrail.geometry = geoData.body.features[0].geometry;
    runningtrail.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    runningtrail.author = req.user._id;
    await runningtrail.save();
    console.log(runningtrail);
    req.flash('success', 'Successfully made a new runningtrail!');
    res.redirect(`/runningtrails/${runningtrail._id}`)
}

module.exports.showRunningtrail = async (req, res,) => {
    const runningtrail = await Runningtrail.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!runningtrail) {
        req.flash('error', 'Cannot find that runningtrail!');
        return res.redirect('/runningtrails');
    }
    res.render('runningtrails/show', { runningtrail });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const runningtrail = await Runningtrail.findById(id)
    if (!runningtrail) {
        req.flash('error', 'Cannot find that runningtrail!');
        return res.redirect('/runningtrails');
    }
    res.render('runningtrails/edit', { runningtrail });
}

module.exports.updateRunningtrail = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const runningtrail = await Runningtrail.findByIdAndUpdate(id, { ...req.body.runningtrail });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    runningtrail.images.push(...imgs);
    await runningtrail.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await runningtrail.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated runningtrail!');
    res.redirect(`/runningtrails/${runningtrail._id}`)
}

module.exports.deleteRunningtrail = async (req, res) => {
    const { id } = req.params;
    await Runningtrail.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted runningtrail')
    res.redirect('/runningtrails');
}