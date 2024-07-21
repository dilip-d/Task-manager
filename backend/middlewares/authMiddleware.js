import jwt from "jsonwebtoken";
import prisma from "../config/db.config.js";

export const protect = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  console.log("token", token);

  if (!token) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res
        .status(401)
        .json({ error: "User not found, authorization denied" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token is not valid" });
  }
};
