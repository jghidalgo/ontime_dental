import AboutSectionOne from '@/startup-template/components/About/AboutSectionOne';
import AboutSectionTwo from '@/startup-template/components/About/AboutSectionTwo';
import Blog from '@/startup-template/components/Blog';
import Brands from '@/startup-template/components/Brands';
import ScrollUp from '@/startup-template/components/Common/ScrollUp';
import Contact from '@/startup-template/components/Contact';
import Features from '@/startup-template/components/Features';
import Footer from '@/startup-template/components/Footer';
import Header from '@/startup-template/components/Header';
import Hero from '@/startup-template/components/Hero';
import Pricing from '@/startup-template/components/Pricing';
import ScrollToTop from '@/startup-template/components/ScrollToTop';
import Testimonials from '@/startup-template/components/Testimonials';
import Video from '@/startup-template/components/Video';

export default function Home() {
  return (
    <>
      <Header />
      <ScrollUp />
      <Hero />
      <Features />
      <Video />
      <Brands />
      <AboutSectionOne />
      <AboutSectionTwo />
      <Testimonials />
      <Pricing />
      <Blog />
      <Contact />
      <Footer />
      <ScrollToTop />
    </>
  );
}
