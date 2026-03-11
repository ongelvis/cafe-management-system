import { Input } from 'antd';
import type { InputProps } from 'antd';

interface ReusableTextboxProps extends InputProps {
  label?: string;
}

export default function ReusableTextbox({ label, ...props }: ReusableTextboxProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontWeight: 500 }}>{label}</label>}
      <Input {...props} />
    </div>
  );
}
