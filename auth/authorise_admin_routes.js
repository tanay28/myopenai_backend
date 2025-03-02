const jwt = require("jsonwebtoken");
require('dotenv').config();
module.exports = {
  authoriseAdminRoutes: (req, res, next) => {
    let token = req.get("authorization");
    let currentUser = req.get("currentUser");
    if (token) {
      // Remove Bearer from string
      token = token.slice(7);
      try {
        const decoded = jwt.verify(token, process.env.SALT);
        if (decoded.result.email === currentUser) {
          if (decoded.result.role == 1) {
            req.decoded = decoded.result;
            next();
          } else {
            return res.status(400).json({
              status: 400,
              message: "You are not authorised to access this.!! Please reach out to your admin."
            });
          }
          } else {
            return res.status(400).json({
              status: 400,
              message: "Token is not valid for this user.!! Please retry with a valid user."
            });
          }
      } catch (e) {
        return res.json({
          status: 400,
          message: "Invalid Token..."
        });
      }
    } else {
      return res.json({
        success: 0,
        message: "Access Denied! Unauthorized User"
      });
    }
  }
};