import axiosInstance from "../services/axiosInstance";

export const fetchTasks = async () => {
  const response = await axiosInstance.get("/api/task/tasks");
  return response.data;
};

export const createTask = async (task) => {
  const response = await axiosInstance.post("/api/task/tasks", task);
  return response.data;
};

export const updateTask = async (id, task) => {
  const response = await axiosInstance.put(`/api/task/tasks/${id}`, task);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await axiosInstance.delete(`/api/task/tasks/${id}`);
  return response.data;
};
