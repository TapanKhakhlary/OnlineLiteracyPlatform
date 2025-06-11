const functions = require("firebase-functions");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Your existing helloWorld function
exports.helloWorld = functions.https.onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

// Secure function to grant teacherAdmin role
exports.setTeacherAdmin = functions.https.onCall(async (data, context) => {
  // 1. Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be logged in to perform this action",
    );
  }

  // 2. Verify the requester is an admin
  if (!context.auth.token.superAdmin) {
    throw new functions.https.HttpsError(
        "permission-denied",
        "Only super admins can assign teacherAdmin role",
    );
  }

  // 3. Get target user ID from request
  const uid = data.uid;
  if (!uid) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "User ID is required",
    );
  }

  // 4. Set the custom claim
  try {
    await admin.auth().setCustomUserClaims(uid, {
      teacherAdmin: true,
    });
    // Log the action
    logger.info(`Set teacherAdmin claim for user: ${uid}`, {
      adminId: context.auth.uid,
      timestamp: new Date().toISOString(),
    });
    return {success: true, message: `Teacher admin role assigned to ${uid}`};
  } catch (error) {
    logger.error("Error setting custom claim:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Failed to set custom claim",
        error.message,
    );
  }
});
