// API route for user registration

import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { username, phone, password } = req.body;

    // Validation
    if (!username || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const trimmedUsername = username.trim();
    const trimmedPhone = phone.trim();

    if (trimmedUsername.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    // Validate phone number format: +998-XX-XXX-XX-XX
    const phoneRegex = /^\+998-\d{2}-\d{3}-\d{2}-\d{2}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      return res.status(400).json({ error: 'Phone number must be in format: +998-XX-XXX-XX-XX' });
    }

    // Extract digits only for storage
    const phoneDigits = trimmedPhone.replace(/[^\d]/g, '');
    if (phoneDigits.length !== 12) { // +998 + 9 digits = 12
      return res.status(400).json({ error: 'Phone number must be in format: +998-XX-XXX-XX-XX' });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username: trimmedUsername });
    if (existingUser) {
      return res.status(400).json({ error: 'This username is already taken. Please choose another one.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (store formatted phone)
    const user = await User.create({
      username: trimmedUsername,
      phone: trimmedPhone, // Store formatted phone: +998-XX-XXX-XX-XX
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        phone: user.phone,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000 || error.code === 11001) {
      return res.status(400).json({ error: 'This username is already taken. Please choose another one.' });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message).join(', ');
      return res.status(400).json({ error: messages || 'Validation failed' });
    }
    
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
}

