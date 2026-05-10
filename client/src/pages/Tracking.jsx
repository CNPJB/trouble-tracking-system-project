import { useAuth } from '../context/AuthContext.jsx';
// Custom Hooks
import { useLoadingState } from '../hooks/useLoadingState.js';

// Components
import { LoadingSpinner, ErrorAlert } from '../components/LoadingSpinner.jsx';

const Tracking = () => {
    const { user } = useAuth();
    // --- State and functions for loading and error handling ---
    const { loading, startLoading, setError, setSuccess, reset } = useLoadingState();

    if (!user) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Authentication required</div>;
    }
    return (
        <div className="tracking-page">
            <LoadingSpinner
                isLoading={loading.isLoading}
                message="กำลังประมวลผล..."
            />
            <h1>Tracking Page</h1>
            <p>Here you can track the status of your reported issues.</p>
            <p>(This page is under construction. Please check back later!)</p>
        </div>
    );
}

export default Tracking;