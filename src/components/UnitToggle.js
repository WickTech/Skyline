import React from 'react';

// Segmented control for °C / °F. Purely client-side — switching never refetches.
const UnitToggle = ({ unit, onChange }) => (
  <div className="unit-toggle" role="group" aria-label="Temperature unit">
    <button
      type="button"
      className={`unit-toggle__btn ${unit === 'celsius' ? 'is-active' : ''}`}
      aria-pressed={unit === 'celsius'}
      onClick={() => onChange('celsius')}
    >
      °C
    </button>
    <button
      type="button"
      className={`unit-toggle__btn ${unit === 'fahrenheit' ? 'is-active' : ''}`}
      aria-pressed={unit === 'fahrenheit'}
      onClick={() => onChange('fahrenheit')}
    >
      °F
    </button>
  </div>
);

export default UnitToggle;
