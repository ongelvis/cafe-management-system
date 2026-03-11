import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Space, Upload, message, Modal } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { getCafes, createCafe, updateCafe } from '../api';
import ReusableTextbox from '../components/ReusableTextbox';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';

interface CafeFormValues {
  name: string;
  description: string;
  location: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function CafeForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form] = Form.useForm<CafeFormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useUnsavedChanges(isDirty);

  // Prefill form in edit mode
  useEffect(() => {
    if (!isEdit || !id) return;
    getCafes().then(cafes => {
      const cafe = cafes.find(c => c.id === id);
      if (cafe) {
        form.setFieldsValue({ name: cafe.name, description: cafe.description, location: cafe.location });
        if (cafe.logo) {
          setFileList([{ uid: '-1', name: 'logo', status: 'done', url: `data:image/png;base64,${cafe.logo}` }]);
        }
      }
    });
  }, [id, isEdit, form]);

  const handleCancel = () => {
    if (isDirty) {
      Modal.confirm({
        title: 'Unsaved Changes',
        content: 'You have unsaved changes. Are you sure you want to cancel?',
        okText: 'Leave',
        cancelText: 'Stay',
        onOk: () => navigate('/cafes'),
      });
    } else {
      navigate('/cafes');
    }
  };

  const handleSubmit = async (values: CafeFormValues) => {
    let logo: string | null = null;
    if (fileList[0]?.originFileObj) {
      logo = await fileToBase64(fileList[0].originFileObj as File);
    }

    const payload = { ...values, ...(logo ? { logo } : {}) };

    try {
      if (isEdit && id) {
        await updateCafe(id, payload);
        messageApi.success('Cafe updated');
      } else {
        await createCafe(payload);
        messageApi.success('Cafe created');
      }
      setIsDirty(false);
      setTimeout(() => navigate('/cafes'), 500);
    } catch {
      messageApi.error('Failed to save cafe');
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      {contextHolder}
      <h2 style={{ marginBottom: 24 }}>{isEdit ? 'Edit Café' : 'Add New Café'}</h2>

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
          <ReusableTextbox placeholder="Cafe name (6–10 chars)" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            { required: true, message: 'Description is required' },
            { max: 256, message: 'Description must be at most 256 characters' },
          ]}
        >
          <ReusableTextbox placeholder="Describe the cafe (max 256 chars)" />
        </Form.Item>

        <Form.Item label="Logo">
          <Upload
            listType="picture"
            fileList={fileList}
            maxCount={1}
            beforeUpload={file => {
              if (file.size > 2 * 1024 * 1024) {
                messageApi.error('Logo must be smaller than 2MB');
                return Upload.LIST_IGNORE;
              }
              setFileList([{ ...file, originFileObj: file } as UploadFile]);
              setIsDirty(true);
              return false; // prevent auto-upload
            }}
            onRemove={() => { setFileList([]); setIsDirty(true); }}
          >
            <Button icon={<UploadOutlined />}>Upload Logo (max 2MB)</Button>
          </Upload>
        </Form.Item>

        <Form.Item
          label="Location"
          name="location"
          rules={[{ required: true, message: 'Location is required' }]}
        >
          <ReusableTextbox placeholder="e.g. Orchard" />
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
