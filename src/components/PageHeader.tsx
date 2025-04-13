import React, { ReactNode } from 'react';

interface PageHeaderProps {
  heading: string;
  subheading?: string;
  icon?: ReactNode;
}

export const PageHeader = ({ 
  heading, 
  subheading, 
  icon 
}: PageHeaderProps) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center gap-2">
        {icon && <div className="text-primary">{icon}</div>}
        <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
      </div>
      {subheading && (
        <p className="text-muted-foreground">{subheading}</p>
      )}
    </div>
  );
}; 