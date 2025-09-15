import HeroBanner from "@/components/home/hero-banner";
import NewThisWeek from "@/components/home/new-this-week";
import CollectionsSection from "@/components/home/collections-section";

interface HomePageData {
  featuredProducts: any[];
  newProducts: any[];
  saleProducts: any[];
  categories: any[];
  heroBannerProduct: any;
  brands: any[];
  stats: {
    totalProducts: number;
    totalCategories: number;
    totalBrands: number;
  };
}

async function getHomePageData(): Promise<HomePageData | null> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/home`, {
      cache: 'no-store', // Ensure fresh data
    });

    if (!res.ok) {
      console.error('Failed to fetch home page data');
      return null;
    }

    const result = await res.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Error fetching home page data:', error);
    return null;
  }
}

export default async function Home() {
  const homeData = await getHomePageData();

  if (!homeData) {
    // Fallback to components without data if API fails
    return (
      <>
        <HeroBanner />
        <NewThisWeek products={homeData?.newProducts} />
        <CollectionsSection categories={homeData?.categories} featuredProducts={
          homeData?.featuredProducts
        } />
      </>
    );
  }

  return (
    <>
      <HeroBanner
        product={homeData.heroBannerProduct}
        stats={homeData.stats}
      />
      <NewThisWeek
        products={homeData.newProducts}
        featuredProducts={homeData.featuredProducts}
      />
      <CollectionsSection
        categories={homeData.categories}
        saleProducts={homeData.saleProducts}
      />
    </>
  );
}
