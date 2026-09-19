import React from 'react';
import { ChevronRight } from 'lucide-react';
import Navbar from './components/Navbar';
import DashboardPreview from './components/DashboardPreview';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-[#ededed] p-3 sm:p-4 font-sans text-neutral-900 selection:bg-[#ef4d23] selection:text-white">
      {/* Hero container that clips everything inside */}
      <div className="relative w-full h-[calc(100vh-24px)] sm:h-[calc(100vh-32px)] overflow-hidden bg-[#d9d9d9] rounded-2xl sm:rounded-3xl">
        
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disableRemotePlayback
          poster="https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&q=60"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          {...({
            'webkit-playsinline': 'true',
            'x5-playsinline': 'true',
          } as React.VideoHTMLAttributes<HTMLVideoElement>)}
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260424_064411_9e9d7f84-9277-41f4-ab10-59172d89e6be.mp4"
            type="video/mp4"
          />
        </video>

        {/* Overlay above video */}
        <div className="absolute inset-0 bg-white/10 pointer-events-none" />

        {/* Foreground content wrapper */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between overflow-y-auto lg:overflow-hidden">
          {/* Top Navbar */}
          <Navbar />

          {/* Centered Hero Content */}
          <div className="flex flex-col items-center px-4 pt-6 sm:pt-10 pb-6 sm:pb-8 text-center shrink-0">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-sm text-[13px] font-medium text-neutral-800">
              <span className="w-2 h-2 rounded-full bg-[#ef4d23] shrink-0" />
              Convix Software
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: 'clamp(36px, 8vw, 72px)',
                lineHeight: 1.05,
                fontWeight: 500,
                letterSpacing: '-0.02em',
              }}
              className="mt-5 sm:mt-6 max-w-4xl text-neutral-950 font-sans"
            >
              Shaping{' '}
              <span
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: 'italic',
                  fontWeight: 400,
                }}
              >
                Agencies
              </span>
              <br />
              of tomorrow
            </h1>

            {/* Subtitle */}
            <p
              style={{ fontSize: 'clamp(13px, 3.5vw, 16px)' }}
              className="mt-4 sm:mt-6 text-neutral-700 px-2 max-w-2xl font-normal leading-relaxed"
            >
              The All-In-One Software Powering the Future of PR Agencies
            </p>

            {/* CTA button */}
            <a
              href="#get-started"
              className="mt-6 sm:mt-8 inline-flex items-center gap-3 bg-[#0b0f1a] hover:bg-neutral-900 text-white rounded-full pl-6 sm:pl-7 pr-2 py-2 sm:py-2.5 text-[14px] font-medium transition-all shadow-md group"
            >
              <span>Get Started</span>
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors">
                <ChevronRight className="w-4 h-4 text-white" />
              </span>
            </a>
          </div>

          {/* Dashboard Preview bleeding off bottom edge */}
          <div className="w-full pb-0 mt-auto">
            <DashboardPreview />
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;
