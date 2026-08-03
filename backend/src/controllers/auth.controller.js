const firebaseAuth = async (req, res) => {
  try {
    console.log("========== FIREBASE AUTH START ==========");

    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "No ID token provided.",
      });
    }

    console.log("ID Token Received: YES");
    console.log("Firebase API Key:", process.env.FIREBASE_API_KEY);

    const apiKey = process.env.FIREBASE_API_KEY;

    if (!apiKey) {
      throw new Error("FIREBASE_API_KEY is missing from environment variables.");
    }

    const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`;

    const response = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idToken,
      }),
    });

    const data = await response.json();

    console.log("Google Response:");
    console.log(JSON.stringify(data, null, 2));

    if (!response.ok) {
      return res.status(401).json({
        success: false,
        message: data.error?.message || "Google token verification failed.",
      });
    }

    if (!data.users || data.users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "No Firebase user found.",
      });
    }

    const firebaseUser = data.users[0];

    const email = firebaseUser.email;
    const phone = firebaseUser.phoneNumber || "";
    const displayName =
      firebaseUser.displayName ||
      email?.split("@")[0] ||
      "User";

    console.log("Firebase User:", email);

    let user = null;

    if (email) {
      user = await User.findOne({ email });
    }

    if (!user && phone) {
      user = await User.findOne({ phone });
    }

    if (!user) {
      let referralCode;

      while (true) {
        referralCode = generateReferralCode();

        const exists = await User.findOne({
          referralCode,
        });

        if (!exists) break;
      }

      user = await User.create({
        email: email || `${Date.now()}@placeholder.com`,
        passwordHash: idToken.substring(0, 20),
        displayName,
        phone,
        referralCode,
        isApproved: false,
        isActive: true,
      });

      return res.status(403).json({
        success: false,
        code: "PENDING_APPROVAL",
        message:
          "Account created successfully. Waiting for admin approval.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is disabled.",
      });
    }

    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        code: "PENDING_APPROVAL",
        message: "Account pending admin approval.",
      });
    }

    const accessToken = generateAccessToken({
      id: user._id.toString(),
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user._id.toString(),
    });

    user.refreshToken = refreshToken;

    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

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
    console.error(error.stack);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};