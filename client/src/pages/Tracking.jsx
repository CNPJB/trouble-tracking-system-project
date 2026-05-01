import { useAuth } from '../context/AuthContext.jsx';

const Tracking = () => {

    const { user } = useAuth();
    if (!user) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Authentication required</div>;
    }
    return (
        <div className="tracking-page">
            <h1>Tracking Page</h1>
            <p>Here you can track the status of your reported issues.</p>
            <p>(This page is under construction. Please check back later!)</p>
        </div>
    );
}

export default Tracking;