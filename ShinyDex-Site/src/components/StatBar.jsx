// src/components/StatBar.jsx
const StatBar = ({ progress, current, total }) => {
  return (
    <div className="d-flex align-items-center gap-3 w-100">
      <div className="progress flex-grow-1" style={{ height: '10px', backgroundColor: '#333' }}>
        <div 
          className="progress-bar bg-warning" 
          style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}
        ></div>
      </div>
      <div className="text-end" style={{ minWidth: '85px' }}>
        <span className="text-warning fw-bold fs-5">{current}</span>
        <span className="text-white-50 small"> / {total}</span>
      </div>
    </div>
  );
};

export default StatBar;