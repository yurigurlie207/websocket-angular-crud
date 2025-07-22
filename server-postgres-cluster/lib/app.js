import { Server } from "socket.io";
import createTodoHandlers from "./todo-management/todo.handlers.js";
// import { setupPrimary, setupWorker } from "@socket.io/sticky";
import stickyPkg from "@socket.io/sticky";
const { setupPrimary, setupWorker } = stickyPkg;
import { createAdapter } from "@socket.io/postgres-adapter";

export function createApplication(httpServer, components, serverOptions = {}) {
  const io = new Server(httpServer, serverOptions);
  // setupPrimary(io);

  const { createTodo, readTodo, updateTodo, deleteTodo, listTodo } =
    createTodoHandlers(components);

  io.on("connection", (socket) => {
    socket.on("todo:create", createTodo);
    socket.on("todo:read", readTodo);
    socket.on("todo:update", updateTodo);
    socket.on("todo:delete", deleteTodo);
    socket.on("todo:list", listTodo);
  });

  // enable sticky session in the cluster (to remove in standalone mode)
  // setupWorker(io);

  io.adapter(createAdapter(components.connectionPool));

  return io;
}
