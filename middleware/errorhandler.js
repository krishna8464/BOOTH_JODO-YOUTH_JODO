function errorHandler(err, req, res, next) {
    let msg = {
        error: "Server error",
    }
    res.status(500).json(msg);
};

module.exports = {
    errorHandler
};