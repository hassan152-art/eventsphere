const asyncHandler = require('../middleware/asyncHandler');
const { ApiError, success } = require('../utils/apiResponse');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const { sendEmail, sendWelcomeEmail } = require('../services/emailService');

// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { fullName, email, contactNumber, department, enrollmentNumber, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const user = await User.create({
    fullName, email, contactNumber, department, enrollmentNumber, password,
    role: 'participant',
  });

  const token = generateToken(user._id, user.role);

  // Send rich HTML Welcome email
  await sendWelcomeEmail(user);

  success(res, 201, 'Account created successfully', { user: user.toSafeObject(), token });
});

// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid email or password');

  if (user.status === 'suspended') throw new ApiError(403, 'Your account has been suspended. Contact admin.');

  const match = await user.comparePassword(password);
  if (!match) throw new ApiError(401, 'Invalid email or password');

  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken(user._id, user.role);
  success(res, 200, 'Login successful', { user: user.toSafeObject(), token });
});

// @route POST /api/auth/verify-2fa  (admin OTP verification, step 2 of login)
const verifyTwoFactor = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) throw new ApiError(400, 'Email and verification code are required');

  const hashedCode = crypto.createHash('sha256').update(String(code)).digest('hex');

  const user = await User.findOne({
    email,
    twoFactorCode: hashedCode,
    twoFactorExpires: { $gt: Date.now() },
  }).select('+twoFactorCode +twoFactorExpires');

  if (!user) throw new ApiError(400, 'Invalid or expired verification code');

  user.twoFactorCode = undefined;
  user.twoFactorExpires = undefined;
  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken(user._id, user.role);
  success(res, 200, 'Login successful', { user: user.toSafeObject(), token });
});

// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  success(res, 200, 'Current user fetched', { user: req.user });
});

// @route POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always respond success to avoid leaking whether an email is registered
  if (!user) return success(res, 200, 'If that email exists, a reset link has been sent');

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Reset your EventSphere password',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`,
  });

  success(res, 200, 'If that email exists, a reset link has been sent');
});

// @route POST /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) throw new ApiError(400, 'Reset link is invalid or has expired');

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  success(res, 200, 'Password reset successfully. You can now log in.');
});

module.exports = { register, login, verifyTwoFactor, getMe, forgotPassword, resetPassword };
