import { randomUUID } from "node:crypto";
import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query;

      const tasks = database.select(
        "tasks",
        search
          ? {
              title: search,
              description: search,
            }
          : null
      );

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;

      if (!title) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: "title is required" }));
      }

      if (!description) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: "description is required" }));
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: null,
      };

      database.insert("tasks", task);

      return res.writeHead(201).end("Criação de Task");
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      if (!title || !description) {
        return res
          .writeHead(400)
          .end(
            JSON.stringify({ message: "title or description are required" })
          );
      }

      const [task] = database.select("task", { id });

      console.log(task);

      if (!task) {
        return res.writeHead(404).end("task not found");
      }

      database.update("tasks", id, {
        title,
        description,
        updated_at: new Date(),
      });

      return res.writeHead(204).end();
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;

      const task = database.select("task", { id });

      console.log(task);

      if (!task) {
        return res.writeHead(404).end("task not found");
      }

      database.delete("tasks", id);

      return res.writeHead(204).end();
    },
  },
];
