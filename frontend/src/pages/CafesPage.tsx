import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Popconfirm, Space, message, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { getCafes, deleteCafe } from '../api';
import type { Cafe } from '../api';
import ReusableTextbox from '../components/ReusableTextbox';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function CafesPage() {
  const navigate = useNavigate();
  const [rowData, setRowData] = useState<Cafe[]>([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [messageApi, contextHolder] = message.useMessage();
  const gridRef = useRef<AgGridReact>(null);

  const fetchCafes = useCallback(async (location?: string) => {
    try {
      const data = await getCafes(location || undefined);
      setRowData(data);
    } catch {
      messageApi.error('Failed to load cafes');
    }
  }, [messageApi]);

  useEffect(() => {
    fetchCafes();
  }, [fetchCafes]);

  const handleDelete = async (id: string) => {
    try {
      await deleteCafe(id);
      messageApi.success('Cafe deleted');
      fetchCafes(locationFilter || undefined);
    } catch {
      messageApi.error('Failed to delete cafe');
    }
  };

  const columnDefs: ColDef<Cafe>[] = [
    {
      headerName: 'Logo',
      field: 'logo',
      width: 80,
      cellRenderer: (params: ICellRendererParams<Cafe>) =>
        params.value
          ? <Image src={`data:image/png;base64,${params.value}`} width={40} height={40} style={{ objectFit: 'cover', borderRadius: 4 }} />
          : <span style={{ color: '#bbb' }}>—</span>,
    },
    { headerName: 'Name', field: 'name', flex: 1 },
    { headerName: 'Description', field: 'description', flex: 2 },
    {
      headerName: 'Employees',
      field: 'employees',
      width: 120,
      cellRenderer: (params: ICellRendererParams<Cafe>) => (
        <Button
          type="link"
          style={{ padding: 0 }}
          onClick={() => navigate(`/employees?cafe=${encodeURIComponent(params.data!.name)}`)}
        >
          {params.value}
        </Button>
      ),
    },
    { headerName: 'Location', field: 'location', flex: 1 },
    {
      headerName: 'Actions',
      width: 140,
      cellRenderer: (params: ICellRendererParams<Cafe>) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => navigate(`/cafes/edit/${params.data!.id}`)}
          />
          <Popconfirm
            title="Delete this cafe?"
            description="This will also delete all its employees."
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
        <h2 style={{ margin: 0 }}>Cafes</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/cafes/add')}>
          Add New Café
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <ReusableTextbox
          placeholder="Filter by location..."
          value={locationFilter}
          onChange={e => setLocationFilter(e.target.value)}
          style={{ width: 240 }}
          allowClear
          onPressEnter={() => fetchCafes(locationFilter || undefined)}
        />
        <Button onClick={() => fetchCafes(locationFilter || undefined)}>Search</Button>
        <Button onClick={() => { setLocationFilter(''); fetchCafes(); }}>Clear</Button>
      </div>

      <div className="ag-theme-quartz" style={{ height: 500 }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          rowHeight={56}
          pagination
          paginationPageSize={10}
        />
      </div>
    </div>
  );
}
