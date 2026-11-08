import { getAuth } from "@clerk/express";
import type { RequestHandler } from "express";

export const requireAuth: RequestHandler = (req, res, next) => {
  const auth = getAuth(req);

  console.log("Auth diagnostic:", {
    userId: auth.userId,
    sessionId: auth.sessionId,
    authorizationHeaderPresent: Boolean(req.headers.authorization),
    authorizationHeaderStartsWithBearer:
      req.headers.authorization?.startsWith("Bearer "),
  });

  if (!auth.userId) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  next();
};