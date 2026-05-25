function Loader() {
    const spinnerStyles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 9999
        },
        spinner: {
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            animation: 'spin 1s linear infinite'
        }
    };

    return (
        <>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            <div style={spinnerStyles.container}>
                <div style={spinnerStyles.spinner} />
            </div>
        </>
    );
}

export default Loader;
