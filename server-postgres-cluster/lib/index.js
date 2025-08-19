import { createServer } from "http";
import { createApplication } from "./app.js";
import { Sequelize } from "sequelize";
import pg from "pg";
import { PostgresTodoRepository } from "./todo-management/todo.repository.js";

//brought in for user management
import express from "express";
import { initUserModel } from "./user-management/user.model.js";
import { registerUser } from "./user-management/user.handlers.js";

const httpServer = createServer();

const sequelize = new Sequelize("mydb", "myuser", "mypassword", {
  dialect: "postgres",
});

const connectionPool = new pg.Pool({
  user: "myuser",
  host: "localhost",
  database: "mydb",
  password: "mypassword",
  port: 5432,
});

createApplication(
  httpServer,
  {
    connectionPool,
    todoRepository: new PostgresTodoRepository(sequelize),
  },
  {
    cors: {
      origin: ["http://localhost:4200"],
    },
  }
);

const main = async () => {
  console.log('Starting server...');
  // create the tables if they do not exist already
  await sequelize.sync();
  console.log('Database synced successfully');

  // create the table needed by the postgres adapter
  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS socket_io_attachments (
        id          bigserial UNIQUE,
        created_at  timestamptz DEFAULT NOW(),
        payload     bytea
    );
  `);
  console.log('Socket.IO attachments table ready');

  // Initialize User model
  initUserModel(sequelize);

  // Create separate Express server for REST endpoints
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  // Registration endpoint
  app.post("/register", registerUser);

  // Start Express server on port 3001
  app.listen(3001, () => {
    console.log('Express server running on port 3001');
  });

  // Start Socket.IO server on port 3000
  httpServer.listen(3000, () => {
    console.log('Socket.IO server running on port 3000');
  });
};

main();
