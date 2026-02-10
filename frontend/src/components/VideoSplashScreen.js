import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const VideoSplashScreen = () => {
    const navigate = useNavigate();
    const [fadeOut, setFadeOut] = useState(false);
    const videoRef = useRef(null);

    useEffect(() => {
        // Attempt to play with sound if possible
        if (videoRef.current) {
            videoRef.current.play().catch(error => {
                console.log("Autoplay with sound was blocked:", error);
            });
        }

        // Reduced transition time for an "instant" feel
        const navTimer = setTimeout(() => {
            setFadeOut(true);
            // Navigate almost instantly after fade starts
            setTimeout(() => navigate('/manual'), 150);
        }, 6500);

        return () => clearTimeout(navTimer);
    }, [navigate]);

    const handleVideoEnd = () => {
        setFadeOut(true);
        setTimeout(() => navigate('/manual'), 150);
    };

    const unmuteAndPlay = () => {
        if (videoRef.current) {
            videoRef.current.muted = false;
            videoRef.current.play();
        }
    };

    return (
        <div
            className={`fixed inset-0 z-[9999] bg-[#020208] flex items-center justify-center transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
            onClick={unmuteAndPlay}
        >
            <video
                ref={videoRef}
                autoPlay
                playsInline
                onEnded={handleVideoEnd}
                className="w-full h-full object-cover md:object-contain cursor-pointer"
                style={{ filter: 'contrast(1.1) brightness(0.9)' }}
            >
                <source src={process.env.PUBLIC_URL + '/splash_video.mp4'} type="video/mp4" />
                <div className="text-white text-center">
                    <h1 className="text-4xl font-black tracking-widest animate-pulse">RUBIK'S SOLVER</h1>
                </div>
            </video>

            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/40 pointer-events-none" />

            {/* Faster Loading Bar */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-white/5 overflow-hidden rounded-full">
                <div className="h-full bg-blue-500 animate-loading-bar shadow-[0_0_10px_#3b82f6]" />
            </div>

            <style jsx>{`
                @keyframes loading-bar {
                    0% { width: 0; transform: translateX(-100%); }
                    100% { width: 100%; transform: translateX(0); }
                }
                .animate-loading-bar {
                    animation: loading-bar 6.5s linear forwards;
                }
            `}</style>
        </div>
    );
};

export default VideoSplashScreen;
