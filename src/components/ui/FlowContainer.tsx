import React from 'react';

interface FlowContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

const FlowContainer: React.FC<FlowContainerProps> = ({ className, ...props }) => {
  const composedClassName = [
    'flex w-full max-w-[440px] flex-col items-center gap-6 text-center',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={composedClassName} {...props} />;
};

export default FlowContainer;
