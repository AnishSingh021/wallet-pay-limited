const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

// Helper for referral code generation
const generateReferralCode = () => {
  return 'WP' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

const setCookieOptions = () => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
};

// ---------------- REGISTER ----------------
const register = async (req, res) => {
  try {
    console.log("[Auth] Register attempt for:", req.body.email);
    const { email, password, displayName, phone, referredBy } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    let referralCode;
    while (true) {
      referralCode = generateReferralCode();
      const exists = await User.findOne({ referralCode });
      if (!exists) break;
    }

    // Verify referredBy if provided
    if (referredBy) {
      const referrer = await User.findOne({ referralCode: referredBy });
      if (!referrer) {
        return res.status(400).json({ success: false, message: 'Invalid referral code.' });
      }
    }

    const user = await User.create({
      email,
      passwordHash: password, // Pre-save hook hashes it
      displayName,
      phone,
      referralCode,
      referredBy,
      isApproved: false, // Default to false for admin approval
    });

    console.log("[Auth] Registration successful (pending approval):", email);
    return res.status(201).json({
      success: true,
      message: 'Registration successful. Waiting for admin approval.',
      code: 'PENDING_APPROVAL'
    });
  } catch (error) {
    console.error("[Auth] Register error:", error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// ---------------- LOGIN ----------------
const login = async (req, res) => {
  try {
    console.log("[Auth] Login attempt for:", req.body.email);
    const { email, password } = req.body;

    const user = await User.findByEmailWithPassword(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account disabled.' });
    }

    if (!user.isApproved) {
      return res.status(403).json({ success: false, message: 'Account pending admin approval.', code: 'PENDING_APPROVAL' });
    }

    const accessToken = generateAccessToken({ id: user._id.toString(), role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id.toString() });

    user.refreshToken = refreshToken;
    await user.save();

    console.log("[Auth] Login successful. Setting cookie for:", email);
    res.cookie("refreshToken", refreshToken, setCookieOptions());

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: user.toJSON(),
        accessToken
      }
    });
  } catch (error) {
    console.error("[Auth] Login error:", error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// ---------------- REFRESH ----------------
const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token provided.' });
    }

    console.log("[Auth] Refreshing token...");
    
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      console.error("[Auth] Invalid or expired refresh token");
      res.clearCookie("refreshToken", setCookieOptions());
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      res.clearCookie("refreshToken", setCookieOptions());
      return res.status(401).json({ success: false, message: 'Refresh token invalid or revoked.' });
    }

    if (!user.isActive || !user.isApproved) {
      res.clearCookie("refreshToken", setCookieOptions());
      return res.status(403).json({ success: false, message: 'Account inactive or unapproved.' });
    }

    const newAccessToken = generateAccessToken({ id: user._id.toString(), role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user._id.toString() });

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie("refreshToken", newRefreshToken, setCookieOptions());
    console.log("[Auth] Token refresh successful for:", user.email);

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    console.error("[Auth] Refresh error:", error);
    return res.status(500).json({ success: false, message: 'Server error during refresh.' });
  }
};

// ---------------- LOGOUT ----------------
const logout = async (req, res) => {
  try {
    console.log("[Auth] Logout attempt for user:", req.user?.id);
    if (req.user && req.user.id) {
      const user = await User.findById(req.user.id);
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }
    res.clearCookie("refreshToken", setCookieOptions());
    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    console.error("[Auth] Logout error:", error);
    return res.status(500).json({ success: false, message: 'Server error during logout.' });
  }
};

// ---------------- FIREBASE AUTH ----------------
const firebaseAuth = async (req, res) => {
  try {
    console.log("========== FIREBASE AUTH START ==========");

    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: "No ID token provided." });
    }

    console.log("[Auth Firebase] API Key check:", !!process.env.FIREBASE_API_KEY);
    const apiKey = process.env.FIREBASE_API_KEY;
    if (!apiKey) throw new Error("FIREBASE_API_KEY missing");

    const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`;
    const response = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("[Auth Firebase] Google verification failed:", data.error?.message);
      return res.status(401).json({ success: false, message: data.error?.message || "Google token verification failed." });
    }

    if (!data.users || data.users.length === 0) {
      return res.status(401).json({ success: false, message: "No Firebase user found." });
    }

    const firebaseUser = data.users[0];
    const email = firebaseUser.email;
    const phone = firebaseUser.phoneNumber || "";
    const displayName = firebaseUser.displayName || email?.split("@")[0] || "User";

    console.log("[Auth Firebase] Resolved User:", email || phone);

    let user = null;
    if (email) user = await User.findOne({ email: email.toLowerCase() });
    if (!user && phone) user = await User.findOne({ phone });

    // Handle new user creation via Firebase
    if (!user) {
      let referralCode;
      while (true) {
        referralCode = generateReferralCode();
        const exists = await User.findOne({ referralCode });
        if (!exists) break;
      }

      user = await User.create({
        email: (email || `${Date.now()}@placeholder.com`).toLowerCase(),
        passwordHash: idToken.substring(0, 20),
        displayName,
        phone,
        referralCode,
        isApproved: false,
        isActive: true,
      });

      console.log("[Auth Firebase] Created new user (pending approval):", user.email);
      return res.status(403).json({
        success: false,
        code: "PENDING_APPROVAL",
        message: "Account created successfully. Waiting for admin approval.",
      });
    }

    // Existing user checks
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Account is disabled." });
    }

    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        code: "PENDING_APPROVAL",
        message: "Account pending admin approval.",
      });
    }

    // Generate Tokens
    const accessToken = generateAccessToken({ id: user._id.toString(), role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id.toString() });

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, setCookieOptions());
    console.log("[Auth Firebase] Login successful:", user.email);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user: user.toJSON(),
        accessToken,
      },
    });
  } catch (error) {
    console.error("=======================================");
    console.error(" FIREBASE AUTH ERROR ");
    console.error("=======================================");
    console.error(error);
    return res.status(500).json({ success: false, message: error.message || "Firebase Server Error" });
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  firebaseAuth,
};