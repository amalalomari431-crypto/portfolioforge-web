import { auth } from "@/auth";
import { Nav } from "@/components/marketing/nav";
import { Hero } from "@/components/marketing/hero";
import { Philosophy } from "@/components/marketing/philosophy";
import { Features } from "@/components/marketing/features";
import { AiGenerationSection } from "@/components/marketing/ai-generation-section";
import { RecruiterSimulationPreview } from "@/components/marketing/recruiter-simulation-preview";
import { CareerAdvisorPreview } from "@/components/marketing/career-advisor-preview";
import { PortfolioShowcasePreview } from "@/components/marketing/portfolio-showcase-preview";
import { FinalCta } from "@/components/marketing/final-cta";
import { Footer } from "@/components/marketing/footer";

export default async function Home() {
  const session = await auth();
  const isSignedIn = !!session?.user;

  return (
    <>
      <Nav isSignedIn={isSignedIn} />
      <main>
        <Hero isSignedIn={isSignedIn} />
        <Philosophy />
        <Features />
        <AiGenerationSection />
        <RecruiterSimulationPreview />
        <CareerAdvisorPreview />
        <PortfolioShowcasePreview />
        <FinalCta isSignedIn={isSignedIn} />
      </main>
      <Footer />
    </>
  );
}
