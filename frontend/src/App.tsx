import { createBrowserRouter, RouterProvider, NavLink, Navigate, useLocation, Outlet } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { CoffeeOutlined, TeamOutlined } from '@ant-design/icons';
import CafesPage from './pages/CafesPage';
import EmployeesPage from './pages/EmployeesPage';
import CafeForm from './pages/CafeForm';
import EmployeeForm from './pages/EmployeeForm';
import 'antd/dist/reset.css';
import './App.css';

const { Header, Content } = Layout;

function AppLayout() {
  const location = useLocation();
  const selectedKey = location.pathname.startsWith('/employees') ? 'employees' : 'cafes';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '0 24px' }}>
        <span style={{ color: 'white', fontWeight: 700, fontSize: 18, marginRight: 16 }}>
          ☕ Cafe Management
        </span>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          style={{ flex: 1, minWidth: 0 }}
          items={[
            {
              key: 'cafes',
              icon: <CoffeeOutlined />,
              label: <NavLink to="/cafes">Cafes</NavLink>,
            },
            {
              key: 'employees',
              icon: <TeamOutlined />,
              label: <NavLink to="/employees">Employees</NavLink>,
            },
          ]}
        />
      </Header>
      <Content style={{ padding: '24px 32px' }}>
        <Outlet />
      </Content>
    </Layout>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/cafes" replace /> },
      { path: 'cafes', element: <CafesPage /> },
      { path: 'cafes/add', element: <CafeForm /> },
      { path: 'cafes/edit/:id', element: <CafeForm /> },
      { path: 'employees', element: <EmployeesPage /> },
      { path: 'employees/add', element: <EmployeeForm /> },
      { path: 'employees/edit/:id', element: <EmployeeForm /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
