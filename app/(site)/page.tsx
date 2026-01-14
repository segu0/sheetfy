import { CTASection } from "./_components/cta-section";
import { FaqSection } from "./_components/faq-section";
import { ReviewsSection } from "./_components/reviews-section";

import { FeaturesSection } from "./_components/features-section";
import { HeroSection } from "./_components/hero-section";
import { PriceSection } from "./_components/price-section";

export default function Page() {
  return (
    <main>
      <HeroSection />
      <ReviewsSection />
      <FeaturesSection />
      <PriceSection />
      <FaqSection />
      <CTASection />
    </main>
  );
}
