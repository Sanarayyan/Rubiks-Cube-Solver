import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Smartphone, RotateCcw, Play, LayoutGrid, MousePointer2 } from 'lucide-react';
import { cubeAPI, generateSolvedCube, validateCubeStateDetailed } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import CubeNet2D from '../components/CubeNet2D';
import Cube3D from '../components/Cube3D';

const ManualInput = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showSuccess, showError, showInfo } = useToast();

    const [cubeState, setCubeState] = useState(location.state?.cubeState || generateSolvedCube());
    const [inputMode, setInputMode] = useState('3d');
    const [mode] = useState('fast');
    const [solution, setSolution] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [validation, setValidation] = useState(null);
    const [highlightErrors, setHighlightErrors] = useState(false);
    const [showGuide, setShowGuide] = useState(true);
    const [backendStatus, setBackendStatus] = useState('checking');
    const isSolved = JSON.stringify(cubeState) === JSON.stringify(generateSolvedCube());

    useEffect(() => {
        const checkBackend = async () => {
            try {
                await cubeAPI.healthCheck();
                setBackendStatus('online');
            } catch (err) {
                console.error("Backend unreachable on mount:", err);
                setBackendStatus('offline');
            }
        };
        checkBackend();
    }, []);

    const notifyCenterBlocked = () => {
        showInfo("\"The middle squares are locked and can't be changed. Tap the squares around them to pick your colors.\"", 3000);
    };

    const colors = ['W', 'O', 'B', 'Y', 'R', 'G'];
    const faces = [
        { key: 'U', name: 'Up Face', color: 'bg-white' },
        { key: 'R', name: 'Right Face', color: 'bg-orange-500' },
        { key: 'F', name: 'Front Face', color: 'bg-blue-600' },
        { key: 'D', name: 'Down Face', color: 'bg-yellow-400' },
        { key: 'L', name: 'Left Face', color: 'bg-red-600' },
        { key: 'B', name: 'Back Face', color: 'bg-green-600' }
    ];

    const handleStickerClick = (faceIndex, squareIndex) => {
        if (squareIndex === 4) { notifyCenterBlocked(); return; }
        const globalIndex = faceIndex * 9 + squareIndex;
        const currentColor = cubeState[globalIndex];
        const currentIndex = colors.indexOf(currentColor);
        const nextIndex = (currentIndex + 1) % colors.length;
        handleColorChange(faceIndex, squareIndex, colors[nextIndex]);
    };

    const handleColorChange = (faceIndex, squareIndex, newColor) => {
        const newCubeState = [...cubeState];
        const globalIndex = faceIndex * 9 + squareIndex;
        newCubeState[globalIndex] = newColor;
        setCubeState(newCubeState);
        if (showGuide) setShowGuide(false);
        setValidation(null);
        setHighlightErrors(false);
    };

    const resetCube = () => {
        setCubeState(generateSolvedCube());
        setShowGuide(true);
        showInfo('Cube reset to solved state.');
    };

    const solveCube = async () => {
        setIsLoading(true);
        const validationResult = validateCubeStateDetailed(cubeState);
        setValidation(validationResult);

        if (!validationResult.isValid) {
            navigate('/notfound', { state: { cubeState, validation: validationResult } });
            setIsLoading(false);
            return;
        }

        if (isSolved) {
            showInfo('Your cube is already solved! Try scrambling it first.');
            setIsLoading(false);
            return;
        }

        try {
            const result = await cubeAPI.solveCube(cubeState, mode);
            if (result.success) {
                setSolution(result.solution);
                showSuccess('Cube solved successfully!');
                navigate(`/solution/${Date.now()}`, {
                    state: { solution: result.solution, cubeState },
                });
            } else {
                const errorMsg = result.error || 'The cube is in an impossible state. Please check your colors.';
                showError(errorMsg);
                const errorValidation = {
                    isValid: false,
                    errors: [errorMsg]
                };
                navigate('/notfound', { state: { cubeState, validation: errorValidation } });
            }
        } catch (error) {
            console.error('Solve cube error:', error);
            const isNetworkError = !error.response;
            if (isNetworkError) {
                showError(`Server Unreachable: Make sure the backend solver is running on port 8081.`);
            } else {
                const errorMsg = error.response?.data?.error || error.message || 'Server error occurred';
                showError(`Solve Failed: ${errorMsg}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const viewSolution = () => {
        if (solution) {
            navigate(`/solution/${Date.now()}`, {
                state: { solution, cubeState },
            });
        }
    };

    const getColorClasses = (color, faceIdx, sqIdx) => {
        const isError = highlightErrors && validation?.errors?.some(e => e.includes(`Face ${faceIdx + 1}`));
        const base = "transition-all duration-200 shadow-sm hover:scale-105 hover:brightness-110 active:scale-95 ";
        const errStyle = isError ? "ring-2 ring-red-500 ring-offset-1 " : "";

        switch (color) {
            case 'W': return base + errStyle + "bg-white";
            case 'Y': return base + errStyle + "bg-yellow-400";
            case 'R': return base + errStyle + "bg-red-600";
            case 'O': return base + errStyle + "bg-orange-500";
            case 'B': return base + errStyle + "bg-blue-600";
            case 'G': return base + errStyle + "bg-green-600";
            default: return base + errStyle + "bg-slate-700";
        }
    };

    return (
        <div className="h-screen w-full bg-[#03000A] text-white flex flex-col items-center justify-between font-sans relative overflow-hidden">
            {/* Premium Neon Geometric Background */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <svg className="absolute w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                    </defs>
                    {/* Abstract Neon Lines */}
                    <path d="M-10,20 L30,50 L-10,80" fill="none" stroke="url(#neonGrad)" strokeWidth="0.2" className="animate-pulse" />
                    <path d="M110,10 L70,40 L110,70" fill="none" stroke="url(#neonGrad)" strokeWidth="0.2" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="url(#neonGrad)" strokeWidth="0.05" strokeDasharray="1 2" />
                    {/* Hexagonal Grid Overlay */}
                    <pattern id="hexagons" width="10" height="17.32" patternUnits="userSpaceOnUse" patternTransform="scale(1)">
                        <path d="M5 0 L10 2.88 L10 8.66 L5 11.54 L0 8.66 L0 2.88 Z" fill="none" stroke="white" strokeWidth="0.05" opacity="0.1" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#hexagons)" />
                </svg>
                {/* Master Glows */}
                <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-600/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-purple-600/10 blur-[150px] rounded-full" />
            </div>

            {/* Header Section */}
            <div className="w-full px-6 pt-12 pb-2 z-20 flex-none">
                <div className="bg-[#1F1235]/60 backdrop-blur-3xl rounded-[2.5rem] p-5 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                        <Box className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">
                                Input Terminal
                            </h1>
                            <div className={`w-1.5 h-1.5 rounded-full ${backendStatus === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : backendStatus === 'offline' ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-amber-500 animate-pulse'}`} />
                        </div>
                        <h2 className="text-sm font-black text-white leading-none tracking-tight">
                            {isSolved ? 'CUBE IS SOLVED' : 'CONFIG YOUR CUBE'}
                        </h2>
                    </div>
                    {backendStatus === 'offline' && (
                        <div className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20">
                            OFFLINE
                        </div>
                    )}
                </div>
            </div>

            {/* Cube Display Area */}
            <div className="flex-1 w-full flex items-center justify-center relative z-10 p-6 overflow-hidden">
                {inputMode === '3d' && (
                    <div className="w-full h-full max-w-[500px] flex items-center justify-center relative">
                        <Cube3D
                            cubeState={cubeState}
                            onStickerClick={handleStickerClick}
                            lockCenters={true}
                            onCenterBlocked={notifyCenterBlocked}
                        />
                        {showGuide && (
                            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 pointer-events-none z-30 flex flex-col items-center gap-2 animate-pulse">
                                <MousePointer2 className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                                    Tap colors to fill manually
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {inputMode === 'grid' && (
                    <div className="w-full max-w-sm grid grid-cols-2 gap-3 p-4 overflow-y-auto max-h-full scrollbar-hide py-10">
                        {faces.map((face, faceIndex) => (
                            <div key={face.key} className="bg-[#1F1235]/40 backdrop-blur-lg rounded-3xl p-3 border border-white/5 shadow-xl">
                                <p className="text-[9px] font-black text-slate-500 mb-2 uppercase tracking-tight">{face.name}</p>
                                <div className="grid grid-cols-3 gap-1">
                                    {Array.from({ length: 9 }, (_, sqIdx) => {
                                        const color = cubeState[faceIndex * 9 + sqIdx];
                                        return (
                                            <button
                                                key={sqIdx}
                                                onClick={() => handleStickerClick(faceIndex, sqIdx)}
                                                className={`w-full aspect-square rounded-lg border border-black/10 ${getColorClasses(color, faceIndex, sqIdx)}`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {inputMode === 'net' && (
                    <div className="scale-110 sm:scale-120">
                        <CubeNet2D cubeState={cubeState} onCellClick={handleStickerClick} lockCenters={true} onCenterBlocked={notifyCenterBlocked} />
                    </div>
                )}
            </div>

            {/* Mobile Actions Section */}
            <div className="w-full px-6 pb-28 z-20 flex-none scale-100 mb-4">
                <p className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 opacity-70">
                    {inputMode === '3d' ? 'Direct 3D Interaction' : 'Manual Grid Input'}
                </p>
                <div className="flex items-center gap-3 w-full max-w-sm mx-auto">
                    <button
                        onClick={resetCube}
                        className="w-16 h-16 rounded-[2rem] bg-[#1F1235]/80 backdrop-blur-xl border border-white/10 flex items-center justify-center text-slate-400 active:scale-90 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
                    >
                        <RotateCcw size={22} />
                    </button>

                    <button
                        onClick={solveCube}
                        disabled={isLoading}
                        className={`flex-1 h-16 rounded-[2rem] flex items-center justify-center gap-3 transition-all shadow-[0_15px_40px_rgba(244,63,94,0.3)] active:scale-[0.98] ${isLoading ? 'bg-slate-800' : 'bg-gradient-to-r from-rose-500 via-indigo-600 to-blue-600 text-white font-black uppercase tracking-[0.2em] text-xs'}`}
                    >
                        {isLoading ? (
                            <RotateCcw className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Play size={16} fill="white" />
                                <span>Solve Cube</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Bottom Menu Icons - Enhanced Neon Style */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1F1235]/80 backdrop-blur-[25px] border border-white/10 rounded-[2.5rem] p-2.5 flex items-center gap-3 shadow-[0_20px_60px_rgba(0,0,0,0.7)] z-[100] group">
                {/* Glow Border Effect */}
                <div className="absolute inset-0 rounded-[2.5rem] border border-blue-500/20 pointer-events-none group-hover:border-blue-500/40 transition-colors" />

                <button
                    onClick={() => setInputMode('3d')}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative ${inputMode === '3d' ? 'bg-white text-[#1F1235] shadow-[0_4px_20px_rgba(255,255,255,0.2)]' : 'text-slate-400'}`}
                >
                    <Box size={20} strokeWidth={2.5} />
                    {inputMode === '3d' && <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full" />}
                </button>
                <button
                    onClick={() => setInputMode('grid')}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative ${inputMode === 'grid' ? 'bg-white text-[#1F1235] shadow-[0_4px_20px_rgba(255,255,255,0.2)]' : 'text-slate-400'}`}
                >
                    <LayoutGrid size={20} strokeWidth={2.5} />
                    {inputMode === 'grid' && <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full" />}
                </button>
                <button
                    onClick={() => setInputMode('net')}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative ${inputMode === 'net' ? 'bg-white text-[#1F1235] shadow-[0_4px_20px_rgba(255,255,255,0.2)]' : 'text-slate-400'}`}
                >
                    <div className="flex flex-col items-center gap-[1px]">
                        <div className="w-1.5 h-1.5 rounded-[1px] bg-current" />
                        <div className="flex gap-[1px]">
                            {[...Array(3)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-[1px] bg-current" />)}
                        </div>
                    </div>
                    {inputMode === 'net' && <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full" />}
                </button>
                <div className="w-px h-6 bg-white/10 mx-1" />
                <button
                    onClick={() => navigate('/history')}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all text-slate-400 hover:text-white"
                >
                    <Smartphone size={20} strokeWidth={2.5} />
                </button>
            </div>

            {/* Floating Solve Indicator */}
            {solution && (
                <button
                    onClick={viewSolution}
                    className="fixed top-36 right-4 w-12 h-12 bg-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center animate-bounce z-50 border-2 border-white/20"
                >
                    <Play size={20} fill="white" />
                </button>
            )}
        </div>
    );
};

export default ManualInput;
