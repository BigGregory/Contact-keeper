const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const { body, validationResult } = require('express-validator');

const router = express.Router();

const User = require('../models/User');

// @route    GET /api/auth
// @desc     Get logged in user
// @access   Private
router.get('/', (req, res) => {
  res.send('Get logged in user');
});

// @route    POST /api/auth
// @desc     Auth user & get token
// @access   Public
router.post(
  '/',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          status: 'failure',
          msg: 'Invalid credentials',
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          status: 'failure',
          msg: 'Invalid password',
        });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        {
          expiresIn: 360000,
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (error) {
      console.error(error.message);
      return res.status(500).send('Server error');
    }
  }
);

module.exports = router;
