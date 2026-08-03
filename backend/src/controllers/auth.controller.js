const User = require('../models/User');
const Referral = require('../models/Referral');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { generateReferralCode } = require('../utils/referralCode');
const { REFERRAL_STATUS } = require('../config/constants');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { email, password, displayName, phone, referralCode } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Generate a unique referral code for this user
    let userReferralCode;
    let isUnique = false;
    while (!isUnique) {
      userReferralCode = generateReferralCode();
      const existing = await User.findOne({ referralCode: userReferralCode });
      if (!existing) isUnique = true;
    }

    // Validate referral code if provided
    let referrer = null;
    if (referralCode && referralCode.trim()) {
      referrer = await User.findOne({ referralCode: referralCode.trim() });
      if (!referrer) {
        return res.status(400).json({
          success: false,
          message: 'Invalid referral code.',
        });
      }
    }

    // Create user — passwordHash is set directly, the pre-save hook will hash it
    const user = new User({
      email,
      passwordHash: password,
      displayName,
      phone: phone || '',
      referralCode: userReferralCode,
      referredBy: referralCode || '',
      isApproved: false, // Requires admin approval
      isActive: true,
    });

    await user.save();

    // Create referral record if referred
    if (referrer) {
      await Referral.create({
        referrerId: referrer._id,
        referrerCode: referrer.referralCode,
        referredId: user._id,
        referredName: displayName,
        referredEmail: email,
        status: REFERRAL_STATUS.PENDING,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Account created successfully. Please wait for admin approval before logging in.',
      data: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        referralCode: user.referralCode,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password field included
    const user = await User.findByEmailWithPassword(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check password
    const isPasswordValid = await require('bcryptjs').compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.',
      });
    }

    // Check if approved
    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending admin approval. You will be notified once approved.',
        code: 'PENDING_APPROVAL',
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken({ id: user._id.toString(), role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id.toString() });

    // Store refresh token on user (single-device)
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Return user data (without sensitive fields, handled by toJSON transform)
    const userData = user.toJSON();

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: userData,
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Cookie (refresh token)
 */
const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided.',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      // Clear invalid cookie
      res.clearCookie('refreshToken', { path: '/' });
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token. Please log in again.',
      });
    }

    // Find user and verify stored token matches
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      // Token reuse detected or user not found — clear cookie
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
      res.clearCookie('refreshToken', { path: '/' });
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
      });
    }

    // Check account status
    if (!user.isActive || !user.isApproved) {
      res.clearCookie('refreshToken', { path: '/' });
      return res.status(403).json({
        success: false,
        message: 'Account is no longer active.',
      });
    }

    // Rotate tokens
    const newAccessToken = generateAccessToken({ id: user._id.toString(), role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user._id.toString() });

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Auth
 */
const logout = async (req, res, next) => {
  try {
    // Clear refresh token from DB
    await User.findByIdAndUpdate(req.user.id, { refreshToken: null });

    // Clear cookie
    res.clearCookie('refreshToken', { path: '/' });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Firebase token and login/register user
 * @route   POST /api/auth/firebase
 * @access  Public
 */
const firebaseAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'No ID token provided.' });
    }

    // Verify token using Google Identity Toolkit REST API
    const apiKey = process.env.FIREBASE_API_KEY;
    const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`;
    
    // We can use global fetch in modern Node
    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
    const data = await response.json();

    if (!response.ok || !data.users || data.users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid Firebase ID token.' });
    }

    const firebaseUser = data.users[0];
    const email = firebaseUser.email;
    const phone = firebaseUser.phoneNumber;
    const displayName = firebaseUser.displayName || email?.split('@')[0] || 'User';

    // Find user by email or phone
    let user;
    if (email) user = await User.findOne({ email });
    if (!user && phone) user = await User.findOne({ phone });

    // If no user exists, create one
    if (!user) {
      let userReferralCode;
      let isUnique = false;
      while (!isUnique) {
        userReferralCode = generateReferralCode();
        const existing = await User.findOne({ referralCode: userReferralCode });
        if (!existing) isUnique = true;
      }

      user = new User({
        email: email || `${phone}@placeholder.com`, // Email is required in our schema
        passwordHash: idToken.substring(0, 20), // Placeholder password for OAuth users
        displayName,
        phone: phone || '',
        referralCode: userReferralCode,
        isApproved: false, // Requires admin approval just like regular signup
        isActive: true,
      });
      await user.save();
      
      return res.status(403).json({
        success: false,
        message: 'Account created successfully! Your account is pending admin approval. You will be notified once approved.',
        code: 'PENDING_APPROVAL',
      });
    }

    // Check account status
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.',
      });
    }

    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending admin approval. You will be notified once approved.',
        code: 'PENDING_APPROVAL',
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken({ id: user._id.toString(), role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id.toString() });

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: user.toJSON(),
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refresh, logout, firebaseAuth };
