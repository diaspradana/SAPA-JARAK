import React from 'react';
import HeroSection from '../../components/public/HeroSection';
import ServiceCards from '../../components/public/ServiceCards';

export default function HomeView() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ServiceCards />
    </div>
  );
}
