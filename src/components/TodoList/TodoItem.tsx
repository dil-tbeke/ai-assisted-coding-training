import React from 'react';
import { ListItem, ListItemText, IconButton, Checkbox, Divider, Typography } from '@mui/material';
import type { Todo } from '../../types/Todo';
import { useTodo } from '../../hooks/useTodo';

interface TodoItemProps {
  todo: Todo;
  onEditClick: (todo: Todo) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onEditClick }) => {
  const { toggleTodoCompletion, deleteTodo } = useTodo();

  const hasDueDate = Boolean(todo.dueDate && !Number.isNaN(Date.parse(todo.dueDate)));
  const isOverdue = hasDueDate && !todo.completed && new Date(todo.dueDate as string) < new Date();

  return (
    <>
      <ListItem
        sx={{
          bgcolor: 'background.paper',
          py: 1,
          borderLeft: todo.completed ? '4px solid green' : '4px solid transparent',
          '&:hover': {
            bgcolor: 'action.hover',
            cursor: 'pointer',
          },
        }}
        onClick={() => onEditClick(todo)}
        secondaryAction={
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={e => {
              e.stopPropagation();
              deleteTodo(todo.id);
            }}
          >
            Delete
          </IconButton>
        }
      >
        <Checkbox
          edge="start"
          checked={todo.completed}
          onClick={e => {
            e.stopPropagation();
            toggleTodoCompletion(todo.id);
          }}
          color="primary"
          sx={{ mr: 1 }}
        />
        <ListItemText
          disableTypography
          primary={
            <Typography
              variant="body1"
              sx={{
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? 'text.secondary' : 'text.primary',
                fontWeight: 500,
              }}
            >
              {todo.title}
            </Typography>
          }
          secondary={
            <>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  textDecoration: todo.completed ? 'line-through' : 'none',
                }}
              >
                {todo.description}
              </Typography>
              {hasDueDate && (
                <Typography
                  variant="caption"
                  sx={{
                    mt: 0.5,
                    display: 'block',
                    color: isOverdue ? 'error.main' : 'text.secondary',
                  }}
                >
                  Due: {new Date(todo.dueDate as string).toLocaleDateString()}
                </Typography>
              )}
            </>
          }
        />
      </ListItem>
      <Divider />
    </>
  );
};
