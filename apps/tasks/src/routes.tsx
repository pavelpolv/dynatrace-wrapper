import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { TasksList } from './pages/TasksList';
import { TaskDetail } from './pages/TaskDetail';

export const TasksRoutes: React.FC = () => {
  return (
    <Switch>
      <Route exact path="/tasks" component={TasksList} />
      <Route path="/tasks/:id" component={TaskDetail} />
    </Switch>
  );
};

export default TasksRoutes;