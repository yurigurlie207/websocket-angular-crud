import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// JWT middleware for authentication
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const user = jwt.verify(token, 'SECRET_KEY');
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Factory function to create user handlers with repository
export default function (components) {
  const { userRepository } = components;
  
  return {
    // Register function
    registerUser: async (req, res) => {
      console.log('Registration request received:', req.body);
      const { username, password } = req.body;
      if (!username || !password) {
        console.log('Missing fields');
        return res.status(400).json({ error: "Missing fields" });
      }
      
      try {
        const existing = await userRepository.findByUsername(username);
        if (existing) {
          console.log('User already exists:', username);
          return res.status(400).json({ error: "User exists" });
        }
        
        const passwordHash = bcrypt.hashSync(password, 10);
        console.log('Creating user:', username);
        await userRepository.save({ username, passwordHash });
        console.log('User created successfully:', username);
        res.json({ message: "Registered successfully" });
      } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: "Database error" });
      }
    },

    // Login function
    loginUser: async (req, res) => {
      const { username, password } = req.body;
      const user = await userRepository.findByUsername(username);
      if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
        return res.status(401).send("Invalid credentials");
      }
      const token = jwt.sign({ username }, "SECRET_KEY");
      res.json({ token });
    },

    // Get user preferences
    getUserPreferences: async (req, res) => {
      try {
        const username = req.user.username;
        const user = await userRepository.findByUsername(username);
        
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Return user preferences or default preferences if none exist
        const defaultPreferences = {
          emailNotifications: false,
          pushNotifications: false,
          darkMode: false,
          autoSave: true,
          publicProfile: false,
          newsletter: false,
          twoFactorAuth: false,
          locationSharing: false
        };

        res.json(user.preferences || defaultPreferences);
      } catch (error) {
        console.error('Error getting preferences:', error);
        res.status(500).json({ error: 'Database error' });
      }
    },

    // Update user preferences
    updateUserPreferences: async (req, res) => {
      try {
        const username = req.user.username;
        const preferences = req.body;
        
        if (!preferences) {
          return res.status(400).json({ error: 'Preferences data is required' });
        }

        const user = await userRepository.findByUsername(username);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Update user preferences
        user.preferences = { ...user.preferences, ...preferences };
        await userRepository.save(user);

        res.json({ message: 'Preferences updated successfully', preferences: user.preferences });
      } catch (error) {
        console.error('Error updating preferences:', error);
        res.status(500).json({ error: 'Database error' });
      }
    },

    // Get all users (for todo assignment)
    getAllUsers: async (req, res) => {
      try {
        console.log('Getting all users...');
        const users = await userRepository.findAll();
        console.log('Users found:', users);
        const userList = users.map(user => ({ username: user.username }));
        console.log('Sending user list:', userList);
        res.json(userList);
      } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ error: 'Database error' });
      }
    }
  };
}