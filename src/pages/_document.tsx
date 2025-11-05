import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="uz">
      <Head>
        {/* Basic Meta Tags */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="color-scheme" content="light dark" />
        
        {/* Google Search Console Verification */}
        <meta name="google-site-verification" content="yid7tXNMQqDTjVHTUVhc99F-a4HFUEsURW_NwBpjCQc" />
        
        {/* Primary SEO Tags */}
        <meta name="title" content="Kod Editor - Online HTML, CSS, JavaScript Editor" />
        <meta 
          name="description" 
          content="Online HTML, CSS va JavaScript kodlarini yozish, tahrirlash va natijani darhol ko'rish uchun bepul kod editor. Responsive dizayn, dark mode va ko'p tilli qo'llab-quvvatlash." 
        />
        <meta 
          name="keywords" 
          content="kod editor, html editor, css editor, javascript editor, online code editor, live preview, code playground, web development, frontend development, html css js editor" 
        />
        <meta name="author" content="Kod Editor" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="Uzbek" />
        <meta name="revisit-after" content="7 days" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://texnikum.xyz/" />
        <meta property="og:title" content="Kod Editor - Online HTML, CSS, JavaScript Editor" />
        <meta 
          property="og:description" 
          content="Online HTML, CSS va JavaScript kodlarini yozish, tahrirlash va natijani darhol ko'rish uchun bepul kod editor." 
        />
        <meta property="og:image" content="https://texnikum.xyz/logo.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Kod Editor Logo" />
        <meta property="og:locale" content="uz_UZ" />
        <meta property="og:locale:alternate" content="ru_RU" />
        <meta property="og:locale:alternate" content="en_US" />
        <meta property="og:site_name" content="Kod Editor" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://texnikum.xyz/" />
        <meta name="twitter:title" content="Kod Editor - Online HTML, CSS, JavaScript Editor" />
        <meta 
          name="twitter:description" 
          content="Online HTML, CSS va JavaScript kodlarini yozish, tahrirlash va natijani darhol ko'rish uchun bepul kod editor." 
        />
        <meta name="twitter:image" content="https://texnikum.xyz/logo.png" />
        <meta name="twitter:image:alt" content="Kod Editor Logo" />
        <meta name="twitter:creator" content="@texnikum" />
        <meta name="twitter:site" content="@texnikum" />
        
        {/* Favicons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Additional SEO */}
        <meta name="application-name" content="Kod Editor" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Kod Editor" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://texnikum.xyz/" />
        
        {/* Alternate Languages */}
        <link rel="alternate" hrefLang="uz" href="https://texnikum.xyz/?lang=uz" />
        <link rel="alternate" hrefLang="ru" href="https://texnikum.xyz/?lang=ru" />
        <link rel="alternate" hrefLang="en" href="https://texnikum.xyz/?lang=en" />
        <link rel="alternate" hrefLang="x-default" href="https://texnikum.xyz/" />
        
        {/* Performance: Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        {/* Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="SAMEORIGIN" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Kod Editor",
              "alternateName": "Online HTML, CSS, JavaScript Editor",
              "description": "Online HTML, CSS va JavaScript kodlarini yozish, tahrirlash va natijani darhol ko'rish uchun bepul kod editor. Responsive dizayn, dark mode va ko'p tilli qo'llab-quvvatlash.",
              "url": "https://texnikum.xyz",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "Live Preview",
                "HTML Editor",
                "CSS Editor",
                "JavaScript Editor",
                "Dark Mode",
                "Responsive Design",
                "Multi-language Support",
                "Code Formatting",
                "Template Library",
                "Share Code"
              ],
              "browserRequirements": "Requires JavaScript. Requires HTML5.",
              "softwareVersion": "1.0.0",
              "inLanguage": ["uz", "ru", "en"],
              "author": {
                "@type": "Organization",
                "name": "Kod Editor",
                "url": "https://texnikum.xyz"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Kod Editor",
              "url": "https://texnikum.xyz",
              "logo": "https://texnikum.xyz/logo.png",
              "sameAs": [],
              "description": "Online HTML, CSS va JavaScript kodlarini yozish, tahrirlash va natijani darhol ko'rish uchun bepul kod editor."
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Kod Editor",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "5",
                "ratingCount": "1"
              }
            })
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

