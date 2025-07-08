import React from 'react';

type Principal = {
  firstName: string;
  lastName: string;
  socialSecurityNumber: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  street: string;
  street2: string;
  zipCode: string;
  city: string;
  state: string;
  equityOwnershipPercentage: number;
  title: string;
  isPersonalGuarantor: boolean;
  driverLicenseNumber: string;
  driverLicenseIssuedState: string;
};

type PrincipalFormProps = {
  index: number;
  principal: Principal;
  onChange: (index: number, field: keyof Principal, value: any) => void;
  onRemove: (index: number) => void;
};

const PrincipalForm: React.FC<PrincipalFormProps> = ({ index, principal, onChange, onRemove }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    onChange(
      index,
      name as keyof Principal,
      type === 'checkbox' ? checked : value
    );
  };

  return (
    <div className="array-section">
      <div className="array-section-title">Principal #{index + 1}</div>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor={`principal-${index}-firstName`}>First Name</label>
          <input
            type="text"
            id={`principal-${index}-firstName`}
            name="firstName"
            value={principal.firstName}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor={`principal-${index}-lastName`}>Last Name</label>
          <input
            type="text"
            id={`principal-${index}-lastName`}
            name="lastName"
            value={principal.lastName}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor={`principal-${index}-socialSecurityNumber`}>Social Security Number</label>
          <input
            type="text"
            id={`principal-${index}-socialSecurityNumber`}
            name="socialSecurityNumber"
            value={principal.socialSecurityNumber}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor={`principal-${index}-dateOfBirth`}>Date of Birth</label>
          <input
            type="date"
            id={`principal-${index}-dateOfBirth`}
            name="dateOfBirth"
            value={principal.dateOfBirth}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor={`principal-${index}-phoneNumber`}>Phone Number</label>
          <input
            type="text"
            id={`principal-${index}-phoneNumber`}
            name="phoneNumber"
            value={principal.phoneNumber}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor={`principal-${index}-email`}>Email</label>
          <input
            type="email"
            id={`principal-${index}-email`}
            name="email"
            value={principal.email}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor={`principal-${index}-street`}>Street</label>
          <input
            type="text"
            id={`principal-${index}-street`}
            name="street"
            value={principal.street}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor={`principal-${index}-street2`}>Street 2</label>
          <input
            type="text"
            id={`principal-${index}-street2`}
            name="street2"
            value={principal.street2}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor={`principal-${index}-zipCode`}>Zip Code</label>
          <input
            type="text"
            id={`principal-${index}-zipCode`}
            name="zipCode"
            value={principal.zipCode}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor={`principal-${index}-city`}>City</label>
          <input
            type="text"
            id={`principal-${index}-city`}
            name="city"
            value={principal.city}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor={`principal-${index}-state`}>State</label>
          <input
            type="text"
            id={`principal-${index}-state`}
            name="state"
            value={principal.state}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor={`principal-${index}-equityOwnershipPercentage`}>Equity Ownership Percentage</label>
          <input
            type="number"
            id={`principal-${index}-equityOwnershipPercentage`}
            name="equityOwnershipPercentage"
            value={principal.equityOwnershipPercentage}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor={`principal-${index}-title`}>Title</label>
          <input
            type="text"
            id={`principal-${index}-title`}
            name="title"
            value={principal.title}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor={`principal-${index}-driverLicenseNumber`}>Driver License Number</label>
          <input
            type="text"
            id={`principal-${index}-driverLicenseNumber`}
            name="driverLicenseNumber"
            value={principal.driverLicenseNumber}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor={`principal-${index}-driverLicenseIssuedState`}>Driver License Issued State</label>
          <input
            type="text"
            id={`principal-${index}-driverLicenseIssuedState`}
            name="driverLicenseIssuedState"
            value={principal.driverLicenseIssuedState}
            onChange={handleChange}
          />
        </div>
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id={`principal-${index}-isPersonalGuarantor`}
            name="isPersonalGuarantor"
            checked={principal.isPersonalGuarantor}
            onChange={handleChange}
          />
          <label htmlFor={`principal-${index}-isPersonalGuarantor`}>Is Personal Guarantor</label>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="btn-danger"
      >
        🗑️ Remove Principal
      </button>
    </div>
  );
};

export default PrincipalForm;
