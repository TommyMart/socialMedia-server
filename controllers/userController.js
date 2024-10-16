// controllers/userController.js

const User = require('../models/User');  // Import the user model
const bcrypt = require('bcrypt');        // Import bcrypt for password hashing

// Function to handle user sign-up (registration)
exports.signup = async (request, response) => {
    const { name, username, email, password } = request.body;  // Get data from request body

    try {
        // Check if email is already in use
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return response.status(400).json({ message: 'Email is already in use' });
        }

        // Check if username is already in use
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return response.status(400).json({ message: 'Username is already in use' });
        }

        // Hash the password for security
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user with the hashed password
        const newUser = new User({ name, username, email, password: hashedPassword });
        await newUser.save();  // Save the new user to the database
        
        // Respond with a success message
        return response.status(201).json({
            success: true,
            message: 'User created successfully',
            name: newUser.name,  // Return the new user's name
            id: newUser._id      // Return the new user's ID
        });

    } catch (error) {
        console.error('Error during signup:', error);  // Log errors if something goes wrong
        return response.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Function to handle user login
exports.login = async (request, response) => {
    const { email, password } = request.body;  // Get data from request body

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return response.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        // Compare the provided password with the stored (hashed) password
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            // If password is correct, return success and user info
            return response.json({
                success: true,
                message: 'Login successful',
                name: user.name,
                username: user.username,
                id: user._id
            });
        } else {
            // If password is incorrect, return an error
            return response.status(400).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error during login:', error);  // Log errors if something goes wrong
        return response.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getUserById = async (request, response) => {

    const { id } = request.params; // Get email from query params
    try {
        const user = await User.findById(id); // Find the user in DB
        if (!user) {
            return response.status(404).json({ message: 'User not found '})
        }
        response.json({ 
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email
        });
    } catch (error) {
        console.error('Error fetching the user: ', error);
        response.status(500).json({ message: 'Internal server error' });
    }
}
