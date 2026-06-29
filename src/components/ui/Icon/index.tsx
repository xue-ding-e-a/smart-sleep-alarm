import React from 'react';

export type IconName = 'home' | 'sleep' | 'report' | 'profile';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  active?: boolean;
}

const Icon: React.FC<IconProps> = ({ name, size = 24, color, active = false }) => {
  const strokeColor = color || (active ? 'url(#iconGradient)' : 'currentColor');

  const renderIcon = () => {
    switch (name) {
      case 'home':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5B5CFF" />
                <stop offset="100%" stopColor="#7B7CFF" />
              </linearGradient>
            </defs>
            <path
              d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 21V13H15V21"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'sleep':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5B5CFF" />
                <stop offset="100%" stopColor="#7B7CFF" />
              </linearGradient>
            </defs>
            <path
              d="M21 12.79A9 9 0 1 1 11.21 3C11.51 3 11.82 3.02 12.12 3.06C11.42 4.25 11 5.66 11 7.2C11 11.28 14.15 14.6 18.11 14.97C19.5 15.1 20.85 14.83 22 14.22C21.7 13.75 21.37 13.29 21 12.79Z"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17H22"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 17V15C5 13.8954 5.89543 13 7 13H17C18.1046 13 19 13.8954 19 15V17"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'report':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5B5CFF" />
                <stop offset="100%" stopColor="#7B7CFF" />
              </linearGradient>
            </defs>
            <path
              d="M3 3V21H21"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7 17V11"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 17V7"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17 17V13"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'profile':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5B5CFF" />
                <stop offset="100%" stopColor="#7B7CFF" />
              </linearGradient>
            </defs>
            <circle
              cx="12"
              cy="8"
              r="4"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 21C4 17.6863 7.58172 15 12 15C16.4183 15 20 17.6863 20 21"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {renderIcon()}
    </div>
  );
};

export default Icon;
