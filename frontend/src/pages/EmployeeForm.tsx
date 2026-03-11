import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Space, Radio, Select, message, Modal } from 'antd';
import { getCafes, getEmployees, createEmployee, updateEmployee } from '../api';
import type { Cafe } from '../api';
import ReusableTextbox from '../components/ReusableTextbox';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';

interface EmployeeFormValues {
  name: string;
  email_address: string;
  phone_number: string;
  gender: 'Male' | 'Female';
  cafe_id?: string;
}

export default function EmployeeForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form] = Form.useForm<EmployeeFormValues>();
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useUnsavedChanges(isDirty);

  // Load cafe list (and prefill employee data in edit mode) in a single coordinated fetch
  useEffect(() => {
    if (isEdit && id) {
      Promise.all([getCafes(), getEmployees()])
        .then(([allCafes, employees]) => {
          setCafes(allCafes);
          const emp = employees.find(e => e.id === id);
          if (emp) {
            const matchedCafe = allCafes.find(c => c.name === emp.cafe);
            form.setFieldsValue({
              name: emp.name,
              email_address: emp.email_address,
              phone_number: emp.phone_number,
              gender: emp.gender,
              cafe_id: matchedCafe?.id,
            });
          }
        })
        .catch(() => messageApi.error('Failed to load data'));
    } else {
      getCafes().then(setCafes).catch(() => messageApi.error('Failed to load cafes'));
    }
  }, [id, isEdit, form, messageApi]);

  const handleCancel = () => {
    if (isDirty) {
      Modal.confirm({
        title: 'Unsaved Changes',
        content: 'You have unsaved changes. Are you sure you want to cancel?',
        okText: 'Leave',
        cancelText: 'Stay',
        onOk: () => navigate('/employees'),
      });
    } else {
      navigate('/employees');
    }
  };

  const handleSubmit = async (values: EmployeeFormValues) => {
    try {
      if (isEdit && id) {
        await updateEmployee({ id, ...values });
        messageApi.success('Employee updated');
      } else {
        await createEmployee(values);
        messageApi.success('Employee created');
      }
      setIsDirty(false);
      setTimeout(() => navigate('/employees'), 500);
    } catch {
      messageApi.error('Failed to save employee');
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      {contextHolder}
      <h2 style={{ marginBottom: 24 }}>{isEdit ? 'Edit Employee' : 'Add New Employee'}</h2>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={() => setIsDirty(true)}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[
            { required: true, message: 'Name is required' },
            { min: 6, message: 'Name must be at least 6 characters' },
            { max: 10, message: 'Name must be at most 10 characters' },
          ]}
        >
          <ReusableTextbox placeholder="Full name (6–10 chars)" />
        </Form.Item>

        <Form.Item
          label="Email Address"
          name="email_address"
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Enter a valid email address' },
          ]}
        >
          <ReusableTextbox placeholder="e.g. john@example.com" />
        </Form.Item>

        <Form.Item
          label="Phone Number"
          name="phone_number"
          rules={[
            { required: true, message: 'Phone number is required' },
            {
              pattern: /^[89][0-9]{7}$/,
              message: 'Must start with 8 or 9 and be exactly 8 digits',
            },
          ]}
        >
          <ReusableTextbox placeholder="e.g. 91234567" maxLength={8} />
        </Form.Item>

        <Form.Item
          label="Gender"
          name="gender"
          rules={[{ required: true, message: 'Gender is required' }]}
        >
          <Radio.Group>
            <Radio value="Male">Male</Radio>
            <Radio value="Female">Female</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="Assigned Café" name="cafe_id">
          <Select
            placeholder="Select a café (optional)"
            allowClear
            options={cafes.map(c => ({ value: c.id, label: c.name }))}
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">Submit</Button>
            <Button onClick={handleCancel}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}
