import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useCalibrationData } from '../hooks/useCalibration';

function CalibrationCheckLayout() {
  const { data, loading, error } = useCalibrationData();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: '5rem', textAlign: 'center' }}>
        <h2>Loading user data...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '5rem', textAlign: 'center' }}>
        <h2>Error: {error}</h2>
      </div>
    );
  }

  if (!data && location.pathname !== '/calibration') {
    return <Navigate to="/calibration" replace />;
  }

  return <Outlet />;
}

export default CalibrationCheckLayout;
