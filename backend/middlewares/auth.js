const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized: Please log in" }); 
    }

    if (!req.user) {
        console.error("❌ ERROR: req.user is undefined!");
        return res.status(401).json({ message: "Unauthorized: User data missing" });
    }

    res.locals.user = req.user; // Attach userId to locals for templates
    next(); // Proceed to the next middleware
};

module.exports = { isLoggedIn };
