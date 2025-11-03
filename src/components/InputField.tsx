import React from 'react';
import EyeOffIcon from '../assets/eye-off.svg';
import { FONT_SIZES } from '../styles/theme';
import {
  flexColumn,
  flexCenter,
  inputField,
  inputContainer,
  inputLabel,
  scaled,
} from '../styles/mixins';

interface InputFieldProps {
  type: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  type,
  value,
  onChange,
  label,
  onKeyDown,
  disabled = false,
}) => {
  return (
    <div
      style={{
        width: scaled(512),
        ...flexColumn,
      }}
    >
      <div style={inputContainer}>
        <div
          style={{
            ...flexCenter,
            alignSelf: 'stretch',
            padding: `${scaled(type === 'password' ? 4 : 8)} 0 ${scaled(type === 'password' ? 4 : 8)} ${scaled(16)}`,
          }}
        >
          <div
            style={{
              height: scaled(40),
              flex: 1,
              ...flexColumn,
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <input
              type={type}
              value={value}
              onChange={e => {
                const newValue = e.target.value;
                onChange(newValue);
              }}
              onKeyDown={onKeyDown}
              placeholder=""
              disabled={disabled}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
              style={{
                ...inputField,
                fontSize: FONT_SIZES.base,
                position: 'relative',
                zIndex: 2,
              }}
            />
            <div
              style={{
                ...inputLabel,
                top: scaled(-16),
                left: scaled(-4),
                padding: `0 ${scaled(4)}`,
                fontSize: FONT_SIZES.sm,
              }}
            >
              <div style={{ position: 'relative' }}>{label}</div>
            </div>
          </div>
          {type === 'password' && (
            <div
              style={{
                ...flexCenter,
                height: scaled(48),
                width: scaled(48),
                padding: scaled(12),
                boxSizing: 'border-box',
                cursor: 'pointer',
              }}
            >
              <img
                src={EyeOffIcon}
                alt="Toggle password visibility"
                style={{
                  width: scaled(24),
                  height: scaled(24),
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InputField;

