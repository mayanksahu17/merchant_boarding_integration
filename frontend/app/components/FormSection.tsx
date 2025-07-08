import React, { ReactNode } from 'react';

type FormSectionProps = {
  active: boolean;
  id: string;
  title: string;
  children?: ReactNode;
};

const FormSection: React.FC<FormSectionProps> = ({ active, id, title, children }) => {
  return (
    <div className={`form-section ${active ? 'active' : ''}`} id={id}>
      <div className="section-title">{title}</div>
      {children}
    </div>
  );
};

export default FormSection;