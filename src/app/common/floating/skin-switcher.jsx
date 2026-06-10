import { useState } from "react";
import { updateSkinStyle } from "../../../globals/constants";

function SkinSwitcher() {
    const [showColors, setShowColors] = useState(false);

    const skinColors = [
        { id: 1, color: "#FF6B6B", name: "Red" },
        { id: 2, color: "#4ECDC4", name: "Cyan" },
        { id: 3, color: "#45B7D1", name: "Blue" },
        { id: 4, color: "#FFA07A", name: "Orange" },
        { id: 5, color: "#98D8C8", name: "Mint" },
        { id: 6, color: "#6C5CE7", name: "Purple" },
        { id: 7, color: "#A29BFE", name: "Lavender" },
        { id: 8, color: "#74B9FF", name: "Light Blue" },
        { id: 9, color: "#00B894", name: "Green" },
        { id: 10, color: "#FDCB6E", name: "Yellow" },
        { id: 11, color: "#E17055", name: "Dark Orange" },
        { id: 12, color: "#2D3436", name: "Dark Gray" },
    ];

    const handleSkinChange = (skinId) => {
        updateSkinStyle(String(skinId), false, false);
        setShowColors(false);
    };

    return (
        <>
            <div className="skin-switcher-wrapper">
                <button
                    className="skin-switcher-toggle"
                    onClick={() => setShowColors(!showColors)}
                    title="Change Theme Color"
                >
                    <i className="feather-droplet" />
                </button>

                {showColors && (
                    <div className="skin-color-panel">
                        <div className="skin-color-title">Theme Colors</div>
                        <div className="skin-color-grid">
                            {skinColors.map((skin) => (
                                <button
                                    key={skin.id}
                                    className="skin-color-btn"
                                    style={{ backgroundColor: skin.color }}
                                    onClick={() => handleSkinChange(skin.id)}
                                    title={skin.name}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .skin-switcher-wrapper {
                    position: fixed;
                    right: 20px;
                    bottom: 120px;
                    z-index: 999;
                }

                .skin-switcher-toggle {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    transition: all 0.3s ease;
                }

                .skin-switcher-toggle:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
                }

                .skin-color-panel {
                    position: absolute;
                    bottom: 70px;
                    right: 0;
                    background: white;
                    border-radius: 12px;
                    padding: 15px;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
                    min-width: 220px;
                    animation: slideUp 0.3s ease;
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .skin-color-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 12px;
                    text-align: center;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .skin-color-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                }

                .skin-color-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 6px;
                    border: 2px solid transparent;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                }

                .skin-color-btn:hover {
                    transform: scale(1.05);
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
                    border-color: #999;
                }

                @media (max-width: 768px) {
                    .skin-switcher-wrapper {
                        right: 10px;
                        bottom: 100px;
                    }

                    .skin-color-panel {
                        min-width: 200px;
                    }

                    .skin-color-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
            `}</style>
        </>
    );
}

export default SkinSwitcher;
