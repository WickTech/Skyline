import React from 'react';

// Shimmer placeholders shown while the first results load. Matching the real
// layout's shape avoids a jarring content shift when data arrives.
const Skeleton = () => (
  <div className="skeleton" aria-hidden="true">
    <div className="card sk-current">
      <div className="sk sk-line sk-line--lg" />
      <div className="sk sk-line sk-line--sm" />
      <div className="sk sk-temp" />
      <div className="sk-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div className="sk sk-tile" key={i} />
        ))}
      </div>
    </div>
    <div className="sk-side">
      <div className="card">
        <div className="sk sk-line sk-line--sm" />
        <div className="sk sk-gauge" />
      </div>
      <div className="card">
        <div className="sk sk-line sk-line--sm" />
        <div className="sk-grid sk-grid--row">
          {Array.from({ length: 5 }).map((_, i) => (
            <div className="sk sk-tile" key={i} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default Skeleton;
