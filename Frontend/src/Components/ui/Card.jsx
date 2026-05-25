import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  shadow = 'soft',
  border = true,
  ...props
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const shadows = {
    none: '',
    soft: 'shadow-soft',
    medium: 'shadow-medium',
    strong: 'shadow-strong',
  };

  const baseClasses = `bg-white rounded-xl transition-all duration-200 ${
    border ? 'border border-secondary-200' : ''
  } ${paddings[padding]} ${shadows[shadow]}`;

  const hoverClasses = hover ? 'hover:shadow-medium hover:-translate-y-1' : '';

  const classes = `${baseClasses} ${hoverClasses} ${className}`;

  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15)' }}
        transition={{ duration: 0.2 }}
        className={classes}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

// Specialized card components
export const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = 'primary',
  trend,
  className = '' 
}) => {
  const colors = {
    primary: 'from-primary-500 to-primary-600',
    success: 'from-success-500 to-success-600',
    warning: 'from-warning-500 to-warning-600',
    danger: 'from-danger-500 to-danger-600',
    secondary: 'from-secondary-500 to-secondary-600',
  };

  return (
    <Card hover className={`overflow-hidden ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${colors[color]} opacity-5`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} text-white`}>
            {icon}
          </div>
          {trend && (
            <div className={`text-sm font-medium ${
              trend > 0 ? 'text-success-600' : trend < 0 ? 'text-danger-600' : 'text-secondary-600'
            }`}>
              {trend > 0 ? '+' : ''}{trend}%
            </div>
          )}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-secondary-900 mb-1">{value}</h3>
          <p className="text-sm font-medium text-secondary-600 mb-1">{title}</p>
          {subtitle && (
            <p className="text-xs text-secondary-500">{subtitle}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export const InfoCard = ({ 
  title, 
  description, 
  icon, 
  action,
  variant = 'default',
  className = '' 
}) => {
  const variants = {
    default: 'border-secondary-200',
    success: 'border-success-200 bg-success-50',
    warning: 'border-warning-200 bg-warning-50',
    danger: 'border-danger-200 bg-danger-50',
    info: 'border-primary-200 bg-primary-50',
  };

  return (
    <Card className={`${variants[variant]} ${className}`} border={false}>
      <div className="flex items-start space-x-4">
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-secondary-900 mb-1">{title}</h3>
          {description && (
            <p className="text-sm text-secondary-600">{description}</p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </Card>
  );
};

export default Card;
