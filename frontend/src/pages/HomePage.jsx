import React, { useState } from 'react';
import { ArrowRight, ArrowUpRight, Plus, Cpu, FileText, Calendar, Wrench, Shield, Bell, History, MoreVertical, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function HomePage({ setActivePage, openOCRModal, openAddApplianceModal, openWatchDemoModal, onSelectAppliance }) {
  const [activeSubNav, setActiveSubNav] = useState('All Appliances');

  const subNavItems = [
    { name: 'All Appliances', target: 'appliances' },
    { name: 'Documents', target: 'documents' },
    { name: 'Service Schedule', target: 'services' },
    { name: 'Warranty', target: 'warranty' },
    { name: 'Reminders', target: 'services' },
    { name: 'Service History', target: 'services' },
  ];

  const fourFeatures = [
    {
      number: '01',
      title: 'Appliance Management',
      description: 'Add, organize and manage all your household appliances in one place.',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
      action: () => setActivePage('appliances')
    },
    {
      number: '02',
      title: 'Documents with OCR',
      description: 'Upload bills and documents and extract important information automatically.',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
      action: openOCRModal
    },
    {
      number: '03',
      title: 'Service Scheduling',
      description: 'Set maintenance schedules and never miss a service again.',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      action: () => setActivePage('services')
    },
    {
      number: '04',
      title: 'Service History & Logs',
      description: 'Keep a complete chronological log of all appliance maintenance and repairs.',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      action: () => setActivePage('services')
    }
  ];

  const showcaseAppliances = [
    {
      id: 1,
      name: 'LG Refrigerator',
      category: 'Kitchen',
      location: 'Kitchen',
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80',
      model: 'GL-B257'
    },
    {
      id: 2,
      name: 'LG Air Conditioner',
      category: 'Bedroom',
      location: 'Bedroom',
      status: 'Service Due',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      model: 'DualCOOL-1.5T'
    },
    {
      id: 3,
      name: 'Samsung Washing Machine',
      category: 'Utility Room',
      location: 'Utility Room',
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=800&q=80',
      model: 'WW90T-FrontLoad'
    },
    {
      id: 4,
      name: 'Sony Television',
      category: 'Living Room',
      location: 'Living Room',
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80',
      model: 'Bravia XR-65'
    }
  ];

  return (
    <div className="space-y-24 bg-white text-gray-900 pb-16">

      {/* HERO SECTION */}
      <section className="pt-12 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Hero Content */}
          <div className="lg:col-span-6 space-y-6">

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-black leading-[1.08]">
              Your home.<br />
              <span className="text-gray-900">All in one place.</span>
            </h1>

            <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
              Manage your appliances, documents, warranties, services and more — with simplicity and peace of mind.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setActivePage('dashboard')}
                className="bg-black hover:bg-gray-800 text-white font-semibold text-base px-8 py-4 rounded-full transition-all shadow-md hover:shadow-xl flex items-center gap-2 group cursor-pointer"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>


            </div>
          </div>

          {/* Right Hero Realistic Interior Showcase Visual */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200/80 bg-gray-50 aspect-[4/3] group">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
                alt="Modern Bright Household Interior"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />



            </div>
          </div>
        </div>
      </section>

      {/* HORIZONTAL FEATURE SUB-NAVIGATION */}
      <div className="border-y border-gray-100 bg-gray-50/50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
            {subNavItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveSubNav(item.name);
                  setActivePage(item.target);
                }}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${activeSubNav === item.name
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:text-black border border-gray-200'
                  }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURE SECTION: "Everything your home needs." */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-black">
            Everything your home needs.
          </h2>
          <p className="text-lg text-gray-500 mt-3 leading-relaxed">
            From adding appliances to tracking warranties and services, HomeCare Hub helps you stay organized and worry-free.
          </p>
        </div>

        {/* 4 Large Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {fourFeatures.map((feat) => (
            <div
              key={feat.number}
              onClick={feat.action}
              className="group bg-white rounded-3xl p-8 border border-gray-200/90 hover:border-black transition-all hover-lift cursor-pointer flex flex-col justify-between space-y-8"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-bold text-gray-400 font-mono tracking-wider">{feat.number}</span>
                  <div className="w-11 h-11 rounded-full border border-gray-200 group-hover:bg-black group-hover:text-white group-hover:border-black flex items-center justify-center transition-all">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>

                <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-6 bg-gray-50">
                  <img
                    src={feat.image}
                    alt={feat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <h3 className="text-2xl font-bold text-black tracking-tight">{feat.title}</h3>
                <p className="text-gray-500 text-sm mt-2 leading-relaxed">{feat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* APPLIANCE SECTION: "Your Home." */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight text-black">
              Your Home.
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              A quick view of your appliances and their status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActivePage('appliances')}
              className="text-sm font-bold text-black hover:underline flex items-center gap-1 cursor-pointer"
            >
              View All Appliances →
            </button>
            <button
              onClick={openAddApplianceModal}
              className="bg-black hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2.5 rounded-full transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Appliance
            </button>
          </div>
        </div>

        {/* Appliance Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {showcaseAppliances.map((app) => (
            <div
              key={app.id}
              onClick={() => onSelectAppliance(app.id)}
              className="group bg-white rounded-3xl border border-gray-200/90 overflow-hidden hover-lift cursor-pointer p-5 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-gray-50 border border-gray-100">
                  <img
                    src={app.image}
                    alt={app.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border shadow-xs ${app.status === 'Active'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                      {app.status}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{app.category}</p>
                <h3 className="text-lg font-bold text-black tracking-tight mt-0.5">{app.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Location: {app.location}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-medium">
                <span>Model: {app.model}</span>
                <div className="w-8 h-8 rounded-full border border-gray-200 group-hover:bg-black group-hover:text-white flex items-center justify-center transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
