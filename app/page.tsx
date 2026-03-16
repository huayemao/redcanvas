import { Analytics } from "@vercel/analytics/react"
import { APP_CONFIG, SEO_CONFIG } from './config';
import HomeClient from './HomeClient';


const Home = () => {
  return (
    <>
      <Analytics />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: APP_CONFIG.appName,
            description: APP_CONFIG.appDescription,
            url: APP_CONFIG.baseUrl,
            applicationCategory: 'ProductivityApplication',
            operatingSystem: 'All',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'CNY',
              availability: 'https://schema.org/InStock'
            },
            featuredImage: {
              '@type': 'ImageObject',
              url: `${APP_CONFIG.baseUrl}/og-image.png`,
              width: 1200,
              height: 630
            }
          })
        }}
      />
      <HomeClient />
    </>
  );
};

export default Home;
