import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { upsertStreamUser } from "../lib/stream.js";

// User Signup Controller
export async function signup(req, res) {
    try {
        // === Input Validation ===
        const { email, password, fullName } = req.body;
        if (!email || !password || !fullName) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password.length < 6) {
            return res
                .status(400)
                .json({ message: "Password must be at least 6 characters" });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Email is not valid" });
        }

        // === Check for Existing User ===
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // === Create New User with Random Avatar ===
        const idx = Math.floor(Math.random() * 100) + 1;
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;
        const newUser = await User.create({
            fullName,
            email,
            password,
            profilePic: randomAvatar,
        });

        // === Create/Update Stream User (for chat/video features) ===
        try {
            await upsertStreamUser({
                id: newUser._id.toString(),
                name: newUser.fullName,
                image: newUser.profilePic || "",
            });
            console.log(`Stream User created for ${newUser.fullName}`);
        } catch (error) {
            console.log("Error Creating Stream User:", error);
        }

        // === Generate JWT Token and Set Cookie ===
        const token = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "7d" }
        );
        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        // === Respond with Success and User Data ===
        res.status(200).json({ success: true, user: newUser });
    } catch (error) {
        console.log("Error in signup controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// User Login Controller
export async function login(req, res) {
    try {
        // === Input Validation ===
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: "All fields are required" });

        // === Find User and Validate Password ===
        const user = await User.findOne({ email });
        if (!user)
            return res
                .status(400)
                .json({ message: "Incorrect email or Password" });
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res
                .status(401)
                .json({ message: "Incorrect email or Password" });
        }
        // === Generate JWT Token and Set Cookie ===
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "7d" }
        );
        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        // === Respond with Success and User Data ===
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.log("Error in login controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// User Logout Controller
export function logout(req, res) {
    // === Clear Auth Token Cookie and Respond ===
    res.clearCookie("jwt");
    res.status(200).json({ success: true, message: "Logout Successfull" });
}

export async function onboarding(req, res) {
    try {
        const userId = req.user._id;
        const { fullName, bio, nativeLanguage, learningLanguage, location } =
            req.body;
        if (
            !fullName ||
            !bio ||
            !nativeLanguage ||
            !learningLanguage ||
            !location
        ) {
            return res.status(400).json({
                message: "All fields are required",
                missingFields: [
                    !fullName && "fullName",
                    !bio && "bio",
                    !nativeLanguage && "nativeLanguage",
                    !learningLanguage && "learningLanguage",
                    !location && "location",
                ].filter(Boolean),
            });
        }
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                ...req.body,
                isOnboarded: true,
            },
            { new: true }
        );
        if (!updatedUser)
            return res.status(404).json({ message: "User not found" });

        // === Create/Update Stream User (for chat/video features) ===
        try {
            await upsertStreamUser({
                id: updatedUser._id.toString(),
                name: updatedUser.fullName,
                image: updatedUser.profilePic || "",
            });
            console.log(`Stream User updated after onboarding for ${updatedUser.fullName}`);
        } catch (streamError) {
            console.log("Error Upadating Stream user during onboarding:", streamError.message);
        }

        return res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Onboarding Error:", error)
        res.status(500).json({message:"Internal Server Error"})
    }
}