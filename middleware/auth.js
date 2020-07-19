const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({
      status: 'failure',
      msg: 'No authorization token',
    });
  }

  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));

    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'failure',
      mag: 'Token is not valid',
    });
  }
};
