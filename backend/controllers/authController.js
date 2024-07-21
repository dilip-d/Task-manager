import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/db.config.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthController {
  static async register(req, res) {
    try {
      const { firstName, lastName, email, password } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ message: "Email is already in use." });
      }

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
        },
      });

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      return res.json({
        message: "Account created successfully!",
        user,
        token,
      });
    } catch (error) {
      console.error("Registration failed", error);
      return res
        .status(500)
        .json({ message: "Something went wrong. Please try again." });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).send("Invalid email or password");
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.status(401).send("Invalid email or password");
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      return res.json({ token });
    } catch (error) {
      console.error("Login failed", error);
      return res.status(500).send("Error logging in");
    }
  }

  static async googleLogin(req, res) {
    const { token } = req.body;

    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      console.log("payload", payload);
      //   return;
      const { given_name, family_name, email } = payload;

      let user = await prisma.user.findUnique({
        where: { email: email },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            firstName: given_name,
            lastName: family_name,
            email,
            password: "",
          },
        });
      }

      const jwtToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.status(200).json({ token: jwtToken });
    } catch (error) {
      console.error("Google login failed", error);
      res.status(500).json({ message: "Google login failed", error });
    }
  }
}

export default AuthController;
