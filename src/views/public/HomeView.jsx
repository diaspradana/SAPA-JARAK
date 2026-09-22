import React from 'react';
import HeroSection from '../../components/public/HeroSection';
import ServiceCards from '../../components/public/ServiceCards';
import HowItWorks from '../../components/public/HowItWorks';
import TrackingSection from '../../components/public/TrackingSection';
import TransparencyPreview from '../../components/public/TransparencyPreview';
import FAQSection from '../../components/public/FAQSection';
import VillageContact from '../../components/public/VillageContact';

export default function HomeView() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ServiceCards />
      <HowItWorks />
      <TrackingSection />
      <TransparencyPreview />
      <FAQSection />
      <VillageContact />
    </div>
  );
}
