const router = require("express").Router();
const { setTokenCookie, restoreUser, requireAuth } = require("../../utils/auth");
const { User } = require("../../db/models"); // ✅ Import User model

// Connect restoreUser middleware
router.use(restoreUser);

// Test route for setting a token
router.get('/set-token-cookie', async (_req, res) => {
  const user = await User.findOne({ where: { username: 'Demo-lition' } });

  if (!user) {
    return res.status(404).json({ error: "Demo user not found" });
  }

  setTokenCookie(res, user);
  return res.json({ user });
});

// Test route for restoring user
router.get('/restore-user', (req, res) => res.json(req.user));

// Test route for requiring authentication
router.get('/require-auth', requireAuth, (req, res) => res.json(req.user));

module.exports = router;
