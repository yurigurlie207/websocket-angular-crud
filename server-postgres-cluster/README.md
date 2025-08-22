# WebSocket Angular CRUD with AI Integration

A real-time todo application with user authentication, WebSocket communication, and AI-powered task prioritization using Claude AI.

## Features

- **Real-time Todo Management**: Create, read, update, and delete todos with WebSocket communication
- **User Authentication**: JWT-based authentication with user registration and login
- **User Profiles**: Manage user preferences for household tasks
- **AI Integration**: Claude AI-powered task prioritization based on user preferences
- **Modern UI**: Responsive design with Gestalt principles
- **PostgreSQL Database**: Persistent storage with Sequelize ORM

## Setup

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Claude AI API key from [Anthropic Console](https://console.anthropic.com/)

### Environment Variables

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and add your API key:**
   ```bash
   CLAUDE_API_KEY=your_actual_claude_api_key_here
   ```

3. **Important Security Notes:**
   - Never commit your `.env` file to version control
   - The `.env` file is already added to `.gitignore`
   - Share the `.env.example` file with your team instead

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the database:**
   ```bash
   docker-compose up -d
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

The server will run on:
- Express API: http://localhost:3001
- Socket.IO: http://localhost:3000

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /user/preferences` - Get user preferences
- `PUT /user/preferences` - Update user preferences
- `GET /users` - Get all users (for task assignment)

### AI Integration
- `POST /ai/prioritize` - Prioritize todos using Claude AI
- `GET /ai/insights` - Get AI insights about tasks

## Frontend Setup

1. **Navigate to the Angular client:**
   ```bash
   cd ../angular-client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   ng serve
   ```

The Angular app will run on http://localhost:4200

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Set Preferences**: Configure your household task preferences in the profile page
3. **Create Todos**: Add tasks with titles, priorities, and assignments
4. **AI Prioritization**: Use the "🤖 AI Prioritize" button to get AI-suggested task ordering
5. **AI Insights**: View AI-generated insights about your task patterns

## Security

- API keys are stored in environment variables
- JWT tokens are used for authentication
- Passwords are hashed using bcrypt
- CORS is configured for secure cross-origin requests

## Troubleshooting

### Common Issues

1. **"Claude API error: 404 model not found"**
   - Check that you're using a valid Claude model name
   - Verify your API key is correct and has proper permissions

2. **"Database connection failed"**
   - Ensure PostgreSQL is running
   - Check database credentials in docker-compose.yml

3. **"CORS errors"**
   - Verify the server is running on the correct ports
   - Check that the Angular app is configured to use the correct server URL

### Debug Mode

To see detailed logs, start the server with:
```bash
DEBUG=* node start-express.js
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
