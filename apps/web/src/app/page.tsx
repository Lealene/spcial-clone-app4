import { Hero } from '@/components/home/hero';
import { CommunitiesStrip } from '@/components/home/communities-strip';
import { FeaturedCommunities } from '@/components/home/featured-communities';
import { FeaturedResidences } from '@/components/home/featured-residences';
import { TheLife } from '@/components/home/the-life';
import { Testimonials } from '@/components/home/testimonials';
import { Amenities } from '@/components/home/amenities';
import { MeetTheOwner } from '@/components/home/meet-the-owner';
import { LeadCapture } from '@/components/home/lead-capture';

export default function HomePage() {
  return (
    <>
      <Hero />
      <CommunitiesStrip />
      <FeaturedCommunities />
      <FeaturedResidences />
      <TheLife />
      <Testimonials />
      <Amenities />
      <MeetTheOwner />
      <LeadCapture />
    </>
  );
}
