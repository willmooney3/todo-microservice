import express, { Request, Response } from "express";
import {
  createTodo,
  deleteTodo,
  getAllTodos,
  getTodo,
  updateTodo,
} from "./libs/todoFunctions";

const app = express();
app.use(express.json());

app.get("/todos", async (req: Request, res: Response) => {
  try {
    const result = await getAllTodos({});
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching todos." });
  }
});

app.get("/todos/:todoId", async (req: Request, res: Response) => {
  try {
    const result = await getTodo({
      todoId: req.params.todoId,
    });
    if (result.todo === null) {
      res.status(404).json({ error: "Todo not found." });
    } else {
      res.status(200).json(result);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching todo." });
  }
});

app.post("/todos", async (req: Request, res: Response) => {
  try {
    const result = await createTodo({
      todoData: req.body,
    });
    if (result.todo === null) {
      res.status(500).json({ error: "Error creating todo." });
    } else {
      res.status(201).json(result);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating todo." });
  }
});

app.put("/todos/:todoId", async (req: Request, res: Response) => {
  try {
    const result = await updateTodo({
      todoId: req.params.todoId,
      todoData: req.body,
    });
    if (result.todo === null) {
      res.status(500).json({ message: "Error updating todo." });
    } else {
      res.status(200).json(result);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating todo." });
  }
});

app.delete("/todos/:todoId", async (req: Request, res: Response) => {
  try {
    const result = await deleteTodo({
      todoId: req.params.todoId,
    });
    if (result.status !== "success") {
      res.status(500).json({ message: "Error deleting todo." });
    } else {
      res.status(200).json(result);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting todo." });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
