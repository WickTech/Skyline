import React, { useState } from 'react';
import { FiAlertTriangle, FiChevronDown } from 'react-icons/fi';

// Severe-weather alerts from OpenWeather One Call 3.0. Best-effort: when the
// One Call subscription isn't enabled the list is empty and nothing renders.
const AlertItem = ({ alert }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`alert ${open ? 'alert--open' : ''}`}>
      <button type="button" className="alert__head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <FiAlertTriangle className="alert__icon" aria-hidden="true" />
        <span className="alert__event">{alert.event}</span>
        {alert.sender_name ? <span className="alert__source">{alert.sender_name}</span> : null}
        <FiChevronDown className="alert__chevron" aria-hidden="true" />
      </button>
      {open && alert.description ? <p className="alert__body">{alert.description}</p> : null}
    </div>
  );
};

const Alerts = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return null;
  return (
    <section className="card alerts" aria-label="Weather alerts">
      <h3 className="card__title">Active Alerts</h3>
      {alerts.map((a, i) => (
        <AlertItem key={`${a.event}-${a.start}-${i}`} alert={a} />
      ))}
    </section>
  );
};

export default Alerts;
