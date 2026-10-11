import React from 'react';
import { FiCloud, FiAlertTriangle } from 'react-icons/fi';

// Shared presentational block for the idle (welcome) and error states.
const StateMessage = ({ variant = 'welcome', title, message }) => {
  const isError = variant === 'error';
  return (
    <div className={`state-message ${isError ? 'state-message--error' : ''}`} role={isError ? 'alert' : 'status'}>
      <span className="state-message__icon">{isError ? <FiAlertTriangle /> : <FiCloud />}</span>
      <h2 className="state-message__title">{title}</h2>
      {message ? <p className="state-message__text">{message}</p> : null}
    </div>
  );
};

export default StateMessage;
