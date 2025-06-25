import { Server as HttpServer} from "http";
import * as http from 'http';
import { Server, ServerOptions } from "socket.io";
import { ClientEvents, ServerEvents } from "../../common/events";
import { TodoRepository } from "./todo-management/todo.repository";
import createTodoHandlers from "./todo-management/todo.handlers";
import * as express from 'express';
// import { register, login, authMiddleware } from './user-management/user.handlers';
import * as jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';

// const app = express();
// app.use(express.json());

// app.post('/register', register);
// app.post('/login', login);

// // Protect todo routes
// app.use('/todo', authMiddleware);
// ... your todo routes here

// app.listen(3000, () => console.log('Server running on port 3000'));
// const server: http.Server = http.createServer(app);

// const io = new Server(server); 

// io.use((socket, next) => {
//   const token = socket.handshake.auth.token;
//   if (!token) return next(new Error('Authentication error'));
//   try {
//     const user = jwt.verify(token, 'SECRET_KEY');
//     socket.data.user = user; // Attach user info to socket
//     next();
//   } catch (err) {
//     next(new Error('Authentication error'));
//   }
// });



export interface Components {
  todoRepository: TodoRepository;
}

export function createApplication(
  httpServer: HttpServer,
  components: Components,
  serverOptions: Partial<ServerOptions> = {}
): Server<ClientEvents, ServerEvents> {
  const io = new Server<ClientEvents, ServerEvents>(httpServer, serverOptions);

  const {
    createTodo,
    readTodo,
    updateTodo,
    deleteTodo,
    listTodo,
  } = createTodoHandlers(components);

  io.on("connection", (socket) => {
    socket.on("todo:create", createTodo);
    socket.on("todo:read", readTodo);
    socket.on("todo:update", updateTodo);
    socket.on("todo:delete", deleteTodo);
    socket.on("todo:list", listTodo);
  });

  return io;
}

