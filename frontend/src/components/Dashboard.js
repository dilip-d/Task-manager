import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { fetchTasks, createTask, deleteTask, updateTask } from "../api/taskApi";
import {
  Button,
  Grid,
  Paper,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import "../styles/Dashboard.css";

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  const time = date.toLocaleTimeString([], options);
  const formattedDate = date.toLocaleDateString();
  return `${formattedDate} ${time}`;
};

const Dashboard = () => {
  const [columns, setColumns] = useState({
    todo: { name: "To Do", items: [] },
    inProgress: { name: "In Progress", items: [] },
    done: { name: "Done", items: [] },
  });
  const [openAdd, setOpenAdd] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("todo");
  const [currentTask, setCurrentTask] = useState(null);

  useEffect(() => {
    const getTasks = async () => {
      try {
        const tasks = await fetchTasks();
        const columnsData = {
          todo: { name: "To Do", items: [] },
          inProgress: { name: "In Progress", items: [] },
          done: { name: "Done", items: [] },
        };
        tasks.forEach((task) => {
          columnsData[task.status].items.push(task);
        });
        setColumns(columnsData);
      } catch (error) {
        console.error("Error fetching tasks", error);
      }
    };
    getTasks();
  }, []);

  const handleOpenAdd = () => setOpenAdd(true);
  const handleCloseAdd = () => setOpenAdd(false);
  const handleOpenView = (task) => {
    setCurrentTask(task);
    setOpenView(true);
  };
  const handleCloseView = () => setOpenView(false);
  const handleOpenEdit = (task) => {
    setCurrentTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setSelectedColumn(task.status);
    setOpenEdit(true);
  };
  const handleCloseEdit = () => setOpenEdit(false);

  const handleSaveAdd = async () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || !trimmedDescription) {
      alert("Title and description cannot be empty.");
      return;
    }

    try {
      const newTask = {
        title: trimmedTitle,
        description: trimmedDescription,
        status: selectedColumn,
      };
      const savedTask = await createTask(newTask);

      setColumns((prev) => ({
        ...prev,
        [selectedColumn]: {
          ...prev[selectedColumn],
          items: [...prev[selectedColumn].items, savedTask],
        },
      }));

      setTitle("");
      setDescription("");
      handleCloseAdd();
    } catch (error) {
      console.error("Error creating task", error);
    }
  };

  const handleSaveEdit = async () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || !trimmedDescription || !currentTask) {
      alert("Title and description cannot be empty.");
      return;
    }

    try {
      const updatedTask = {
        title: trimmedTitle,
        description: trimmedDescription,
        status: selectedColumn,
      };
      await updateTask(currentTask.id, updatedTask);

      const updatedColumns = { ...columns };
      const columnItems = updatedColumns[currentTask.status].items.map((item) =>
        item.id === currentTask.id ? { ...item, ...updatedTask } : item
      );
      updatedColumns[currentTask.status].items = columnItems;

      setColumns(updatedColumns);
      setTitle("");
      setDescription("");
      handleCloseEdit();
    } catch (error) {
      console.error("Error updating task", error);
    }
  };

  const handleDelete = async (item) => {
    if (!item) return;

    try {
      await deleteTask(item.id);

      const updatedColumns = { ...columns };
      updatedColumns[item.status].items = updatedColumns[
        item.status
      ].items.filter((task) => task.id !== item.id);

      setColumns(updatedColumns);
      handleCloseView();
    } catch (error) {
      console.error("Error deleting task", error);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      removed.status = destination.droppableId;
      destItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems,
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems,
        },
      });
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems,
        },
      });
    }
  };

  return (
    <div className="dashContainer">
      <Button className="addBtn" onClick={handleOpenAdd}>
        Add Task
      </Button>
      <div className="innerDashContainer">
        <DragDropContext onDragEnd={onDragEnd}>
          {Object.entries(columns).map(([columnId, column]) => (
            <Grid item xs={4} key={columnId} className="tableContainer">
              <Paper className="dashPaper">
                <Typography className="dashHeading" variant="h6">
                  {column.name}
                </Typography>
                <Droppable droppableId={columnId}>
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {column.items.map((item, index) => (
                        <Draggable
                          key={item.id}
                          draggableId={item.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <Paper style={{ margin: "8px", padding: "16px" }}>
                                <p style={{ fontWeight: 700 }}>{item.title}</p>
                                <p>{item.description}</p>
                                <p>
                                  Created at: {formatDateTime(item.createdAt)}
                                </p>
                                <div className="actionBtnContainer">
                                  <button
                                    className="deleteBtn"
                                    onClick={async () => {
                                      await handleDelete(item);
                                    }}
                                  >
                                    Delete
                                  </button>
                                  <button
                                    className="editBtn"
                                    onClick={() => handleOpenEdit(item)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="viewBtn"
                                    onClick={() => handleOpenView(item)}
                                  >
                                    View details
                                  </button>
                                </div>
                              </Paper>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Paper>
            </Grid>
          ))}
        </DragDropContext>
      </div>

      <Dialog open={openAdd} onClose={handleCloseAdd}>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            type="text"
            fullWidth
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField
            select
            margin="dense"
            label="Column"
            fullWidth
            variant="outlined"
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            SelectProps={{
              native: true,
            }}
          >
            <option value="todo">To Do</option>
            <option value="inProgress">In Progress</option>
            <option value="done">Done</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAdd}>Cancel</Button>
          <Button onClick={handleSaveAdd}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openView} onClose={handleCloseView}>
        <DialogTitle>View Task</DialogTitle>
        <DialogContent>
          {currentTask && (
            <>
              <Typography variant="h6">{currentTask.title}</Typography>
              <Typography variant="body1">{currentTask.description}</Typography>
              <Typography variant="body2">
                Created at: {formatDateTime(currentTask.createdAt)}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseView}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEdit} onClose={handleCloseEdit}>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            type="text"
            fullWidth
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField
            select
            margin="dense"
            label="Column"
            fullWidth
            variant="outlined"
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            SelectProps={{
              native: true,
            }}
          >
            <option value="todo">To Do</option>
            <option value="inProgress">In Progress</option>
            <option value="done">Done</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancel</Button>
          <Button onClick={handleSaveEdit}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Dashboard;
