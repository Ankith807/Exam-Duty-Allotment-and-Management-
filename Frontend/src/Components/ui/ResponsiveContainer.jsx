import React from 'react';

const ResponsiveContainer = ({ 
  children, 
  className = '',
  maxWidth = '7xl',
  padding = 'responsive' 
}) => {
  const maxWidths = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'full': 'max-w-full',
  };

  const paddings = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
    responsive: 'p-4 md:p-6 lg:p-8',
  };

  return (
    <div className={`${maxWidths[maxWidth]} mx-auto ${paddings[padding]} ${className}`}>
      {children}
    </div>
  );
};

// Grid component for responsive layouts
export const ResponsiveGrid = ({ 
  children, 
  cols = { sm: 1, md: 2, lg: 3 },
  gap = 'md',
  className = '' 
}) => {
  const gaps = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  const gridCols = `grid-cols-${cols.sm} md:grid-cols-${cols.md} lg:grid-cols-${cols.lg}`;
  
  return (
    <div className={`grid ${gridCols} ${gaps[gap]} ${className}`}>
      {children}
    </div>
  );
};

// Flex component for responsive layouts
export const ResponsiveFlex = ({ 
  children, 
  direction = { sm: 'col', md: 'row' },
  align = 'center',
  justify = 'between',
  gap = 'md',
  className = '' 
}) => {
  const gaps = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  const flexDirection = `flex-${direction.sm} md:flex-${direction.md}`;
  const alignItems = `items-${align}`;
  const justifyContent = `justify-${justify}`;
  
  return (
    <div className={`flex ${flexDirection} ${alignItems} ${justifyContent} ${gaps[gap]} ${className}`}>
      {children}
    </div>
  );
};

// Stack component for vertical layouts
export const Stack = ({ 
  children, 
  spacing = 'md',
  className = '' 
}) => {
  const spacings = {
    xs: 'space-y-1',
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
  };

  return (
    <div className={`${spacings[spacing]} ${className}`}>
      {children}
    </div>
  );
};

// Responsive text component
export const ResponsiveText = ({ 
  children, 
  size = { sm: 'sm', md: 'base', lg: 'lg' },
  weight = 'normal',
  color = 'secondary-900',
  className = '' 
}) => {
  const textSize = `text-${size.sm} md:text-${size.md} lg:text-${size.lg}`;
  const fontWeight = `font-${weight}`;
  const textColor = `text-${color}`;
  
  return (
    <span className={`${textSize} ${fontWeight} ${textColor} ${className}`}>
      {children}
    </span>
  );
};

export default ResponsiveContainer;
