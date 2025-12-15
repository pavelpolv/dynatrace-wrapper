import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { OrderList } from './pages/OrderList';
import { OrderDetail } from './pages/OrderDetail';

export const OrderRoutes: React.FC = () => {
  return (
    <Switch>
      <Route exact path="/order" component={OrderList} />
      <Route path="/order/:id" component={OrderDetail} />
    </Switch>
  );
};

export default OrderRoutes;
