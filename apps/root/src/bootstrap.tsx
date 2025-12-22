import React, { lazy } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { Layout } from 'antd';
import 'antd/dist/antd.css';
import { MetricsManager, MetricsEventType } from '@farzoom/metrics-front-lib';
import ErrorBoundary from './components/ErrorBoundary';
import { TasksPage } from './pages/TasksPage';
import { OrdersPage } from './pages/OrdersPage';

const { Content } = Layout;

// Инициализация метрик (один раз при старте приложения)
MetricsManager.initialize({
  environment: 'dev',
  debugMode: true,  // Включить debug режим для отладки
  enabled: true,    // Метрики включены
});

// Вывести статус метрик в консоль
const metricsManager = MetricsManager.getInstance();
console.log('=== Dynatrace Metrics Status ===');
console.log('Status:', metricsManager.getStatus());
console.log('Ready:', metricsManager.isReady());
console.log('================================');

// Динамический импорт компонентов layout (Header и Sidebar без метрик)
const Header = lazy(() => import('layout/Header').then(module => ({ default: module.Header })));
const Sidebar = lazy(() => import('layout/Sidebar').then(module => ({ default: module.Sidebar })));

const App: React.FC = () => {
  // Отследить загрузку root приложения
  React.useEffect(() => {
    metricsManager.startAction(MetricsEventType.LOAD_ROOT_APP, 'load');
    return () => {
      metricsManager.leaveAction(MetricsEventType.LOAD_ROOT_APP);
    };
  }, []);

  return (
    <Router>
      {/* @ts-expect-error React 17 + TS 5.3 compatibility issue with Ant Design */}
      <Layout style={{ minHeight: '100vh' }}>
        <ErrorBoundary actionName={MetricsEventType.LOAD_HEADER}>
          <Header />
        </ErrorBoundary>
        {/* @ts-expect-error React 17 + TS 5.3 compatibility issue with Ant Design */}
        <Layout>
          <ErrorBoundary actionName={MetricsEventType.LOAD_SIDEBAR}>
            <Sidebar />
          </ErrorBoundary>
          {/* @ts-expect-error React 17 + TS 5.3 compatibility issue with Ant Design */}
          <Layout style={{ marginLeft: 200 }}>
            {/* @ts-expect-error React 17 + TS 5.3 compatibility issue with Ant Design */}
            <Content style={{ margin: 0, minHeight: 280, background: '#fff' }}>
              <Switch>
                <Route path="/tasks">
                  <TasksPage />
                </Route>
                <Route path="/order">
                  <OrdersPage />
                </Route>
                <Route exact path="/">
                  <Redirect to="/tasks" />
                </Route>
              </Switch>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </Router>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
