import React from 'react';
import './style.css';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, disabled = false }) => {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`switch ${checked ? 'switch-checked' : ''} ${disabled ? 'switch-disabled' : ''}`}
      onClick={handleClick}
      disabled={disabled}
    >
      <span className="switch-thumb" />
    </button>
  );
};

export default Switch;
