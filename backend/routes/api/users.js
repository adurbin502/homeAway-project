const express = require('express');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { Op } = require('sequelize');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();

const validateSignup = [
    check('email')
        .exists({ checkFalsy: true })
        .isEmail()
        .withMessage('Invalid email'),
    check('username')
        .exists({ checkFalsy: true })
        .withMessage('Username is required'),
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

    const existingUser = await User.findOne({
        where: {
            [Op.or]: [{ email }, { username }]
        }
    });

    if (existingUser) {
        return res.status(500).json({
            message: "User already exists",
            errors: {
                email: existingUser.email === email ? "User with that email already exists" : undefined,
                username: existingUser.username === username ? "User with that username already exists" : undefined
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

    // Set token cookie
    await setTokenCookie(res, user);

    // Return format matching API documentation
    return res.status(201).json({
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username
        }
    });
});

module.exports = router;