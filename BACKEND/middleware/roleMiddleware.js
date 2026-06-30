const roleMiddleware = async (req, res, next) => {
    try {
        if (req.result.role === 'owner')
            next();
        else
            throw new Error("Not authorized — owner access only");
    } catch (err) {
        res.status(401).send("Error: " + err.message);
    }
}

module.exports = roleMiddleware;
