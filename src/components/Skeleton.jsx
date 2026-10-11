import React from 'react';

// Shimmer placeholders shown while the first results load. Mirrors the real
// dashboard's shape AND height — including the hourly strip, forecast row and
// the map — so nothing shifts down when data replaces it (avoids layout shift).
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
        <div className="sk sk-uv" />
      </div>
    </div>

    <div className="sk-full">
      <div className="card">
        <div className="sk sk-line sk-line--sm" />
        <div className="sk sk-map" />
      </div>
    </div>

    <div className="sk-full">
      <div className="card">
        <div className="sk sk-line sk-line--sm" />
        <div className="sk-grid sk-grid--row">
          {Array.from({ length: 5 }).map((_, i) => (
            <div className="sk sk-tile" key={i} />
          ))}
        </div>
      </div>
    </div>

    <div className="sk-full">
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
