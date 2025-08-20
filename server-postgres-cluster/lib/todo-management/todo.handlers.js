import { Errors, mapErrorDetails, sanitizeErrorMessage } from "../util.js";
import { v4 as uuid } from "uuid";
import Joi from "joi";

const idSchema = Joi.string().guid({
  version: "uuidv4",
});

const todoSchema = Joi.object({
  id: idSchema.alter({
    create: (schema) => schema.forbidden(),
    update: (schema) => schema.required(),
  }),
  createdBy: Joi.string().optional(),
  assignedTo: Joi.string().optional(),
  title: Joi.string().max(256).required(),
  priority: Joi.string().max(256).required(),
  completed: Joi.boolean().required(),
});

export default function (components) {
  const { todoRepository } = components;
  return {
    createTodo: async function (payload, callback) {
      const socket = this;
      const userId = socket.data?.user?.username;

      if (!userId) {
        return callback({
          error: "Authentication required",
        });
      }

      // validate the payload
      const { error, value } = todoSchema.tailor("create").validate(payload, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        return callback({
          error: Errors.INVALID_PAYLOAD,
          errorDetails: mapErrorDetails(error.details),
        });
      }

      value.id = uuid();
      // Use provided createdBy or default to current user
      if (!value.createdBy) {
        value.createdBy = userId;
      }
      // If assignedTo is not provided, default to the creator
      if (!value.assignedTo) {
        value.assignedTo = userId;
      }

      // persist the entity
      try {
        await todoRepository.save(value);
      } catch (e) {
        return callback({
          error: sanitizeErrorMessage(e),
        });
      }

      // acknowledge the creation
      callback({
        data: value.id,
      });

      // notify the other users
      socket.broadcast.emit("todo:created", value);
    },

    readTodo: async function (id, callback) {
      const socket = this;
      const userId = socket.data?.user?.username;

      if (!userId) {
        return callback({
          error: "Authentication required",
        });
      }

      const { error } = idSchema.validate(id);

      if (error) {
        return callback({
          error: Errors.ENTITY_NOT_FOUND,
        });
      }

      try {
        const todo = await todoRepository.findById(id);
        callback({
          data: todo,
        });
      } catch (e) {
        callback({
          error: sanitizeErrorMessage(e),
        });
      }
    },

    updateTodo: async function (payload, callback) {
      const socket = this;
      const userId = socket.data?.user?.username;

      if (!userId) {
        return callback({
          error: "Authentication required",
        });
      }

      const { error, value } = todoSchema.tailor("update").validate(payload, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        return callback({
          error: Errors.INVALID_PAYLOAD,
          errorDetails: mapErrorDetails(error.details),
        });
      }

      try {
        await todoRepository.save(value);
      } catch (e) {
        return callback({
          error: sanitizeErrorMessage(e),
        });
      }

      callback();
      socket.broadcast.emit("todo:updated", value);
    },

    deleteTodo: async function (id, callback) {
      const socket = this;
      const userId = socket.data?.user?.username;

      if (!userId) {
        return callback({
          error: "Authentication required",
        });
      }

      const { error } = idSchema.validate(id);

      if (error) {
        return callback({
          error: Errors.ENTITY_NOT_FOUND,
        });
      }

      try {
        await todoRepository.deleteById(id);
      } catch (e) {
        return callback({
          error: sanitizeErrorMessage(e),
        });
      }

      callback();
      socket.broadcast.emit("todo:deleted", id);
    },

    listTodo: async function (callback) {
      const socket = this;
      const userId = socket.data?.user?.username;

      if (!userId) {
        return callback({
          error: "Authentication required",
        });
      }

      try {
        callback({
          data: await todoRepository.findAll(),
        });
      } catch (e) {
        callback({
          error: sanitizeErrorMessage(e),
        });
      }
    },
  };
}
