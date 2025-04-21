// backend/routes/api/users.js
const express = require('express');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();

// Signup input validation middleware
const validateSignup = [
    check('email')
        .exists({ checkFalsy: true })
        .isEmail()
        .withMessage('Invalid email'),
    check('username')
        .exists({ checkFalsy: true })
        .isLength({ min: 4 })
        .withMessage('Username is required'),
    check('username')
        .not()
        .isEmail()
        .withMessage('Username cannot be an email'),
    check('password')
        .exists({ checkFalsy: true })
        .isLength({ min: 6 })
        .withMessage('Password must be 6 characters or more'),
    check('firstName')
        .exists({ checkFalsy: true })
        .withMessage('First Name is required'),
    check('lastName')
        .exists({ checkFalsy: true })
        .withMessage('Last Name is required'),
    handleValidationErrors
];

// POST /api/users - Sign up a user
router.post('/', validateSignup, async (req, res, next) => {
    const { email, password, username, firstName, lastName } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({
        where: {
            [User.sequelize.Op.or]: [{ email }, { username }]
        }
    });

    if (existingUser) {
        return res.status(500).json({
            message: 'User already exists',
            errors: {
                email: existingUser.email === email ? 'User with that email already exists' : undefined,
                username: existingUser.username === username ? 'User with that username already exists' : undefined
            }
        });
    }

    const hashedPassword = bcrypt.hashSync(password);
    const user = await User.create({
        email,
        username,
        firstName,
        lastName,
        hashedPassword
    });

    const safeUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
    };

    await setTokenCookie(res, safeUser);
    return res.status(201).json({ user: safeUser });
});

module.exports = router;