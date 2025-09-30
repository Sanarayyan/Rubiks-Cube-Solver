import React from 'react';
import { Link } from 'react-router-dom';
import { Palette, History, Zap, Box, Brain, Play, Smartphone } from 'lucide-react';
import Cube3D from '../components/Cube3D';
import { generateSolvedCube } from '../services/api';

const Home = () => {
  const features = [
    {
      icon: Box,
      title: '3D Cube',
      description: 'See a real-looking cube that you can spin and move around',
      color: 'blue'
    },
    {
      icon: Brain,
      title: 'Smart Solver',
      description: 'Our computer brain finds the fastest way to solve your cube',
      color: 'green'
    },
    {
      icon: Play,
      title: 'Easy Steps',
      description: 'We show you exactly which way to turn each part of the cube',
      color: 'yellow'
    },
    {
      icon: Smartphone,
      title: 'Works Everywhere',
      description: 'Use it on your phone, tablet, or computer - it works great on all of them!',
      color: 'purple'
    }
  ];

  const actions = [
    {
      icon: Palette,
      title: 'Manual Input',
      description: 'Click on the cube to tell us what colors you see on each side',
      path: '/manual',
      color: 'green'
    },
    {
      icon: History,
      title: 'View History',
      description: 'See all the cubes you\'ve solved before and how you did it',
      path: '/history',
      color: 'purple'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500 hover:bg-blue-600 text-white',
      green: 'bg-green-500 hover:bg-green-600 text-white',
      yellow: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      purple: 'bg-purple-500 hover:bg-purple-600 text-white'
    };
    return colors[color] || colors.blue;
  };

  const previewState = generateSolvedCube();

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Decorative Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-gradient-to-tr from-blue-400/30 via-indigo-300/30 to-purple-300/30 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-gradient-to-tr from-emerald-300/30 via-teal-300/30 to-cyan-300/30 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-gradient-to-tr from-amber-300/30 via-yellow-300/30 to-orange-300/30 blur-3xl" />
      </div>
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block rounded-2xl px-3 py-1.5 mb-5 bg-white/60 backdrop-blur-xl ring-1 ring-slate-200/60 shadow-sm">
              <span className="text-xs font-semibold tracking-widest text-slate-600">SOLVE FASTER • LOOK COOLER</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 md:mb-6 leading-tight">
              Solve Your
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"> Rubik's Cube</span>
            </h1>
            <p className="text-base sm:text-lg md:text-2xl text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto px-1">
              Can't solve your Rubik's cube? Manually input your colors and get a stylish, step‑by‑step solution.
            </p>
            <div className="flex justify-center">
              <Link
                to="/manual"
                className="tap-target inline-flex items-center justify-center px-8 py-4 rounded-full text-white bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 shadow-[0_10px_28px_rgba(16,185,129,0.35)] hover:shadow-[0_14px_32px_rgba(13,148,136,0.45)] hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-600 active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-400 font-semibold tracking-wide"
              >
                <Palette className="mr-2 h-5 w-5" />
                Open Manual Input
              </Link>
            </div>
          </div>

          {/* 3D Cube Preview */}
          <div className="flex justify-center mb-12 md:mb-16">
            <div className="relative w-full max-w-xl sm:max-w-2xl h-[320px] sm:h-96 rounded-3xl shadow-2xl overflow-hidden bg-white/60 backdrop-blur-xl ring-1 ring-white/60">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-white/20" />
              <Cube3D cubeState={previewState} autoRotate={true} />
            </div>
          </div>
        </div>
      </section>

      {/* Action Cards */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Get Started</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.path}
                  className="group block rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-100 p-[1px] shadow-lg hover:shadow-xl active:shadow-md transition-all duration-200 active:scale-[0.995]"
                >
                  <div className="h-full w-full rounded-2xl bg-white/70 backdrop-blur-xl p-6 sm:p-7 md:p-8 ring-1 ring-white/60">
                    <div className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full ${getColorClasses(action.color)} mb-5 sm:mb-6 group-hover:scale-105 transition-transform`}>
                      <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                      {action.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Features</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="text-center p-5 sm:p-6 bg-white/70 backdrop-blur-xl rounded-xl shadow-md hover:shadow-lg transition-all ring-1 ring-white/60 hover:-translate-y-0.5"
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full ${getColorClasses(feature.color)} mb-3 sm:mb-4`}>
                    <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Ready to Solve Your Cube?</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8">
            Thousands of people have already learned to solve their cubes with our help. You can too!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              to="/history"
              className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 active:bg-gray-800 transition-colors shadow-md active:scale-[0.99]"
            >
              <History className="mr-2 h-5 w-5" />
              View Examples
            </Link>
            <Link
              to="/manual"
              className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-md active:scale-[0.99]"
            >
              <Zap className="mr-2 h-5 w-5" />
              Go to Manual Input
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 