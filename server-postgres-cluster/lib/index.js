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
  // create the tables if they do not exist already
  await sequelize.sync();

  // create the table needed by the postgres adapter
  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS socket_io_attachments (
        id          bigserial UNIQUE,
        created_at  timestamptz DEFAULT NOW(),
        payload     bytea
    );
  `);

  // uncomment when running in standalone mode
  httpServer.listen(3000);
};

//************************************** 
//**** THIS IS THE USER MODEL BIT ******
// const app = express();
// app.use(express.json());

// // Initialize User model
// initUserModel(sequelize);

// // Registration endpoint
// app.post("/register", registerUser);


// // Start both HTTP servers
// httpServer.on("request", app);
//**** END OF USER MODEL BIT ******
//**************************************

main();
