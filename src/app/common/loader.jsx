import { useEffect, useState } from "react";

function Loader({ delay = 0 }) {
    const [isVisible, setIsVisible] = useState(delay === 0);

    useEffect(() => {
        if (delay === 0) return undefined;

        const timeoutId = window.setTimeout(() => setIsVisible(true), delay);
        return () => window.clearTimeout(timeoutId);
    }, [delay]);

    if (!isVisible) return null;

    return (
        <>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .startup-loader-overlay {
                    display: flex;
                    position: fixed;
                    top: 0;
                    left: 0;
                    z-index: 9999;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    height: 100vh;
                    background-color: #ffffff;
                }

                .startup-loader-spinner {
                    width: 70px;
                    height: 70px;
                    border: 6px solid #f3f3f3;
                    border-top: 6px solid #3498db;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
            `}</style>
            <div className="startup-loader-overlay">
                <div className="startup-loader-spinner" />
            </div>
        </>
    );
}

export default Loader;
