import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
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

const ItemType = "TASK";

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

const Task = ({
  task,
  index,
  moveTask,
  handleDelete,
  handleOpenEdit,
  handleOpenView,
}) => {
  const [, ref] = useDrag({
    type: ItemType,
    item: { id: task.id, index, columnId: task.status },
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (draggedItem) => {
      if (draggedItem.index !== index || draggedItem.columnId !== task.status) {
        moveTask(draggedItem.index, index, draggedItem.columnId, task.status);
        draggedItem.index = index;
        draggedItem.columnId = task.status;
      }
    },
  });

  return (
    <div
      ref={(node) => ref(drop(node))}
      style={{ margin: "8px", padding: "1px", ...task.style }}
    >
      <Paper sx={{ padding: "6px" }}>
        <p style={{ fontWeight: 700 }}>{task.title}</p>
        <p>{task.description}</p>
        <p>Created at: {formatDateTime(task.createdAt)}</p>
        <div className="actionBtnContainer">
          <button className="deleteBtn" onClick={() => handleDelete(task)}>
            Delete
          </button>
          <button className="editBtn" onClick={() => handleOpenEdit(task)}>
            Edit
          </button>
          <button className="viewBtn" onClick={() => handleOpenView(task)}>
            View details
          </button>
        </div>
      </Paper>
    </div>
  );
};

const Column = ({
  columnId,
  column,
  moveTask,
  handleDelete,
  handleOpenEdit,
  handleOpenView,
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemType,
    drop: (item) => {
      const { index, columnId: sourceColumnId } = item;
      moveTask(index, columnId, sourceColumnId, columnId);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <Grid item xs={4} key={columnId} className="tableContainer">
      <Paper
        className="dashPaper"
        ref={drop}
        style={{ backgroundColor: isOver ? "#e0e0e0" : "white" }}
      >
        <Typography className="dashHeading" variant="h6">
          {column.name}
        </Typography>
        <div>
          {column.items.map((task, index) => (
            <Task
              key={task.id}
              task={task}
              index={index}
              moveTask={moveTask}
              handleDelete={handleDelete}
              handleOpenEdit={handleOpenEdit}
              handleOpenView={handleOpenView}
            />
          ))}
        </div>
      </Paper>
    </Grid>
  );
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

  const moveTask = async (
    dragIndex,
    hoverIndex,
    sourceColumnId,
    targetColumnId
  ) => {
    const sourceColumn = columns[sourceColumnId];
    const destColumn = columns[targetColumnId];

    const sourceItems = [...sourceColumn.items];
    const destItems = [...destColumn.items];

    if (sourceColumnId === targetColumnId) {
      const [removed] = sourceItems.splice(dragIndex, 1);
      sourceItems.splice(hoverIndex, 0, removed);

      setColumns({
        ...columns,
        [sourceColumnId]: {
          ...sourceColumn,
          items: sourceItems,
        },
      });

      return;
    }

    const [removed] = sourceItems.splice(dragIndex, 1);
    removed.status = targetColumnId;

    if (destItems.length === 0) {
      destItems.push(removed);
    } else {
      destItems.splice(hoverIndex, 0, removed);
    }

    const updatedTask = {
      title: removed.title,
      description: removed.description,
      status: targetColumnId,
    };

    setColumns({
      ...columns,
      [sourceColumnId]: {
        ...sourceColumn,
        items: sourceItems,
      },
      [targetColumnId]: {
        ...destColumn,
        items: destItems,
      },
    });

    try {
      await updateTask(removed.id, updatedTask);
    } catch (error) {
      console.error("Error updating task status", error);

      setColumns({
        ...columns,
        [sourceColumnId]: {
          ...sourceColumn,
          items: sourceItems,
        },
        [targetColumnId]: {
          ...destColumn,
          items: destItems.filter((item) => item.id !== removed.id),
        },
      });
    }
  };

  return (
    <div>
      <DndProvider backend={HTML5Backend}>
        <div className="dashContainer">
          <Button className="addBtn" onClick={handleOpenAdd}>
            Add Task
          </Button>
          <div className="innerDashContainer">
            {Object.entries(columns).map(([columnId, column]) => (
              <Column
                key={columnId}
                columnId={columnId}
                column={column}
                moveTask={(dragIndex, hoverIndex, sourceColumnId) =>
                  moveTask(dragIndex, hoverIndex, sourceColumnId, columnId)
                }
                handleDelete={handleDelete}
                handleOpenEdit={handleOpenEdit}
                handleOpenView={handleOpenView}
              />
            ))}
          </div>
        </div>
      </DndProvider>

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
