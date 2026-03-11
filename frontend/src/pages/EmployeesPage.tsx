import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Popconfirm, Space, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { getEmployees, deleteEmployee } from '../api';
import type { Employee } from '../api';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function EmployeesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [rowData, setRowData] = useState<Employee[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const gridRef = useRef<AgGridReact>(null);

  const cafeFilter = searchParams.get('cafe') ?? undefined;

  const fetchEmployees = useCallback(async (cafe?: string) => {
    try {
      const data = await getEmployees(cafe);
      setRowData(data);
    } catch {
      messageApi.error('Failed to load employees');
    }
  }, [messageApi]);

  useEffect(() => {
    fetchEmployees(cafeFilter);
  }, [cafeFilter, fetchEmployees]);

  const handleDelete = async (id: string) => {
    try {
      await deleteEmployee(id);
      messageApi.success('Employee deleted');
      fetchEmployees(cafeFilter);
    } catch {
      messageApi.error('Failed to delete employee');
    }
  };

  const columnDefs: ColDef<Employee>[] = [
    { headerName: 'Employee ID', field: 'id', width: 140 },
    { headerName: 'Name', field: 'name', flex: 1 },
    { headerName: 'Email Address', field: 'email_address', flex: 1 },
    { headerName: 'Phone Number', field: 'phone_number', width: 140 },
    { headerName: 'Days Worked', field: 'days_worked', width: 130 },
    { headerName: 'Café Name', field: 'cafe', flex: 1, valueFormatter: p => p.value ?? '—' },
    {
      headerName: 'Actions',
      width: 140,
      cellRenderer: (params: ICellRendererParams<Employee>) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => navigate(`/employees/edit/${params.data!.id}`)}
          />
          <Popconfirm
            title="Delete this employee?"
            onConfirm={() => handleDelete(params.data!.id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
            cancelText="Cancel"
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>
          Employees{cafeFilter ? ` — ${cafeFilter}` : ''}
        </h2>
        <Space>
          {cafeFilter && (
            <Button onClick={() => navigate('/employees')}>Show All</Button>
          )}
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/employees/add')}>
            Add New Employee
          </Button>
        </Space>
      </div>

      <div className="ag-theme-quartz" style={{ height: 500 }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          rowHeight={48}
          pagination
          paginationPageSize={10}
        />
      </div>
    </div>
  );
}
