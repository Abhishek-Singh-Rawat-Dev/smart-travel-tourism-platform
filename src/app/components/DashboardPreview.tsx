import React from 'react';
import { TrendingDown, TrendingUp, ChevronDown, X } from 'lucide-react';
import { Gauge } from './Gauge';

export const DashboardPreview: React.FC = () => {
  return (
    <div className="w-full px-3 sm:px-4">
      <div className="bg-[#f5f2ee] rounded-3xl p-4 sm:p-6 w-full max-w-[880px] mx-auto shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-left">
          
          {/* Card 1 — Clicks */}
          <div className="bg-white rounded-2xl p-5 flex flex-col justify-between shadow-sm border border-neutral-100">
            <div>
              <div className="flex justify-between items-center text-[13px] font-medium">
                <span className="text-[#ef4d23]">Clicks</span>
                <span className="text-neutral-500">This Month</span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-[28px] font-semibold text-neutral-900 leading-none">
                  6,896
                </span>
                <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 rounded-full px-2 py-0.5 text-[11px] font-medium">
                  <TrendingDown className="w-3 h-3 text-red-600" />
                  -3,382 (33%)
                </span>
              </div>
              <p className="text-[12px] text-neutral-400 mt-1">Compared to yesterday</p>

              <div className="text-center mt-3 text-[12px] font-medium text-neutral-600">
                Month Target achieved
              </div>

              <div className="mt-1">
                <Gauge value={92} color="#ef4d23" showLabels={true} min="389K" max="425K" />
              </div>
            </div>

            <div className="bg-neutral-100 rounded-full p-1 flex mt-4 text-[12px]">
              <button
                type="button"
                className="flex-1 py-1 px-3 rounded-full bg-white text-neutral-900 shadow-sm text-center font-medium transition-all"
              >
                Impressions
              </button>
              <button
                type="button"
                className="flex-1 py-1 px-3 text-neutral-500 text-center font-medium hover:text-neutral-900 transition-colors"
              >
                Clicks
              </button>
            </div>
          </div>

          {/* Card 2 — Form */}
          <div className="bg-white rounded-2xl p-5 flex flex-col gap-3 shadow-sm border border-neutral-100">
            <div>
              <label className="block text-[12px] text-neutral-700 font-medium mb-1">
                Show figures for
              </label>
              <button
                type="button"
                className="w-full flex items-center justify-between border border-neutral-200 rounded-lg px-3 py-2 text-[13px] text-neutral-800 bg-white hover:border-neutral-300 transition-colors"
              >
                <span>This month</span>
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              </button>
            </div>

            <div>
              <label className="block text-[12px] text-neutral-700 font-medium mb-1">
                Compare period by
              </label>
              <button
                type="button"
                className="w-full flex items-center justify-between border border-neutral-200 rounded-lg px-3 py-2 text-[13px] text-neutral-800 bg-white hover:border-neutral-300 transition-colors"
              >
                <span>Month-to-date (MTD)</span>
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              </button>
            </div>

            <div>
              <label className="block text-[12px] text-neutral-700 font-medium mb-1">
                Ste targets (This month)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-neutral-400 text-[13px]">#</span>
                <input
                  type="text"
                  defaultValue="10"
                  className="w-full border border-neutral-200 rounded-lg pl-7 pr-3 py-1.5 text-[13px] text-neutral-800 font-medium focus:outline-none focus:border-[#ef4d23] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] text-neutral-700 font-medium mb-1">
                Ste targets (This year)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-neutral-400 text-[13px]">#</span>
                <input
                  type="text"
                  defaultValue="100"
                  className="w-full border border-neutral-200 rounded-lg pl-7 pr-3 py-1.5 text-[13px] text-neutral-800 font-medium focus:outline-none focus:border-[#ef4d23] transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 mt-auto">
              <button
                type="button"
                className="bg-[#ef4d23] hover:bg-[#e0431a] text-white rounded-lg px-5 py-2 text-[13px] font-medium transition-colors shadow-sm"
              >
                Save
              </button>
              <button
                type="button"
                className="text-[13px] text-neutral-500 underline hover:text-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                aria-label="Close"
                className="ml-auto text-neutral-400 hover:text-neutral-700 p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 3 — Video Starts */}
          <div className="bg-white rounded-2xl p-5 flex flex-col justify-between shadow-sm border border-neutral-100 sm:col-span-2 lg:col-span-1">
            <div>
              <div className="flex justify-between items-center text-[13px] font-medium">
                <span className="text-[#ef4d23]">Video Starts</span>
                <span className="text-neutral-500">today</span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-[28px] font-semibold text-neutral-900 leading-none">
                  0
                </span>
                <span className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-600 rounded-full px-2 py-0.5 text-[11px] font-medium">
                  <TrendingUp className="w-3 h-3 text-neutral-500" />
                  0
                </span>
              </div>
              <p className="text-[12px] text-neutral-400 mt-1">Compared to yesterday</p>

              <div className="mt-5">
                <Gauge value={68} color="#9ca3af" showLabels={false} />
              </div>
            </div>

            <div className="bg-neutral-100 rounded-full p-1 flex mt-4 text-[12px]">
              <button
                type="button"
                className="flex-1 py-1 px-3 rounded-full bg-white text-neutral-900 shadow-sm text-center font-medium transition-all"
              >
                Video Clicks
              </button>
              <button
                type="button"
                className="flex-1 py-1 px-3 text-neutral-500 text-center font-medium hover:text-neutral-900 transition-colors"
              >
                Video Starts
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;
