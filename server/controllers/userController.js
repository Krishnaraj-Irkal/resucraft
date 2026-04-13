import crypto from 'crypto';
import User from "../models/User.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Resume from "../models/Resume.js";
import { sendVerificationEmail } from '../config/mailer.js';

const generateToken = (userId) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET,{expiresIn:'7d'})
    return token
}

//Controller for user registration
// POST: /api/users/register
export const registerUser = async (req,res) => {
    try {
        const {name,email,password} =req.body;

        //Check if user already exists
        const user = await User.findOne({email})
        if(user) {
            return res.status(409).json({message:'An account with this email already exists'})
        }

        // Create new user with a verification token
        const hashedPassword = await bcrypt.hash(password,10);
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const newUser = await User.create({
            name, email, password: hashedPassword,
            verificationToken, verificationTokenExpiry,
        })

        // Send verification email (non-blocking — don't fail registration if email fails)
        sendVerificationEmail(email, verificationToken).catch(() => {});

        newUser.password = undefined;
        newUser.verificationToken = undefined;

        return res.status(201).json({
            message: 'Account created. Please check your email to verify your account before logging in.',
            user: newUser,
        })

    } catch (error) {
        return res.status(500).json({message:'Something went wrong. Please try again.'})
    }
}


//Controller for user login
// POST: /api/users/login
export const loginUser = async (req,res) => {
    try {
        const {email,password} =req.body;

        //Check if user does not exists
        const user = await User.findOne({email})
        if(!user) {
            return res.status(400).json({message:'Invalid email or password'})
        }

        // Block unverified users
        if(!user.isVerified) {
            return res.status(403).json({message:'Please verify your email address before logging in. Check your inbox for the verification link.'})
        }

        // Verify password is correct
        const isMatch = user.comparePassword(password);
        if(!isMatch) {
            return res.status(400).json({message:'Invalid email or password'})
        }

        //return success message
        const token = generateToken(user._id);
        user.password = undefined;

        return res.status(200).json({message:'Login Successfully', token, user})

    } catch (error) {
        return res.status(500).json({message:'Something went wrong. Please try again.'})
    }
}

// Controller for email verification
// GET: /api/users/verify-email?token=...
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(400).json({ message: 'Verification token is missing' });
        }

        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpiry: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification link. Please register again.' });
        }

        user.isVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpiry = null;
        await user.save();

        return res.status(200).json({ message: 'Email verified successfully. You can now log in.' });

    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
}

// Controller for getting user by id
//GET: /api/users/data
export const getUserById = async (req,res) => {
    try {
        const userId = req.userId;

        // Check if user exists
        const user = await User.findById(userId)
        if(!user) {
            return res.status(404).json({message:'User not found'})
        }

        // if User exists
        user.password = undefined;
        return res.status(200).json({ user})

    } catch (error) {
        return res.status(500).json({message:'Something went wrong. Please try again.'})
    }
}


// Controller for getting user resumes
// GET: /api/users/resumes

export const getUserResumes = async(req,res) => {
    try {
        const userId = req.userId;

        //return user resumes
        const resumes = await Resume.find({userId})
        return res.status(200).json({resumes})

    } catch (error) {
        return res.status(500).json({message:'Something went wrong. Please try again.'})
    }
}