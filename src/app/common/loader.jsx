function Loader() {
    return (
        <>
            <style>{`
                @keyframes app-loader-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .app-loader {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100vh;
                    position: fixed;
                    top: 0;
                    left: 0;
                    z-index: 9999;
                    background: #fff;
                }

                .app-loader-spinner {
                    width: 72px;
                    height: 72px;
                    border: 6px solid #f3f3f3;
                    border-top-color: #A9C731;
                    border-radius: 50%;
                    animation: app-loader-spin 1s linear infinite;
                }
            `}</style>
            <div className="app-loader">
                <div className="app-loader-spinner" />
            </div>
        </>
    );
}

export default Loader;
