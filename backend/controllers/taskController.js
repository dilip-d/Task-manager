import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getTasks = async (req, res) => {
  try {
    const userId = req.user?.id;

    console.log("userId", userId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId: userId,
      },
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error });
  }
};

export const createTask = async (req, res) => {
  const { title, description, status } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!title || !description || !status) {
    return res
      .status(400)
      .json({ message: "Title, description, and status are required" });
  }

  try {
    const newTask = await prisma.task.create({
      data: { title, description, status, userId },
    });
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: "Error creating task", error });
  }
};

export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!title || !description || !status) {
    return res
      .status(400)
      .json({ message: "Title, description, and status are required" });
  }

  try {
    const task = await prisma.task.findUnique({
      where: { id: Number(id) },
    });

    if (!task || task.userId !== userId) {
      return res
        .status(404)
        .json({ message: "Task not found or unauthorized" });
    }

    const updatedTask = await prisma.task.update({
      where: { id: Number(id) },
      data: { title, description, status },
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error });
  }
};

export const deleteTask = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const task = await prisma.task.findUnique({
      where: { id: Number(id) },
    });

    if (!task || task.userId !== userId) {
      return res
        .status(404)
        .json({ message: "Task not found or unauthorized" });
    }

    await prisma.task.delete({
      where: { id: Number(id) },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error });
  }
};
