import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const SEO = ({
    title,
    description,
    keywords,
    canonicalUrl,
    ogImage,
    ogType = 'website',
    noindex = false
}) => {
    const siteName = 'El Mexicano Restaurant';
    const defaultDescription = 'El Mexicano Restaurant - Authentic Mexican cuisine in a warm and welcoming atmosphere. Order online or make a reservation today!';

    return (
        <Helmet>
            {/* Basic meta tags */}
            <title>{title ? `${title} | ${siteName}` : siteName}</title>
            <meta name="description" content={description || defaultDescription} />
            {keywords && <meta name="keywords" content={keywords} />}

            {/* Robots meta tag */}
            <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />

            {/* Canonical URL */}
            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

            {/* Open Graph meta tags */}
            <meta property="og:site_name" content={siteName} />
            <meta property="og:title" content={title || siteName} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta property="og:type" content={ogType} />
            {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
            {ogImage && <meta property="og:image" content={ogImage} />}

            {/* Twitter Card meta tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title || siteName} />
            <meta name="twitter:description" content={description || defaultDescription} />
            {ogImage && <meta name="twitter:image" content={ogImage} />}
        </Helmet>
    );
};

SEO.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    keywords: PropTypes.string,
    canonicalUrl: PropTypes.string,
    ogImage: PropTypes.string,
    ogType: PropTypes.string,
    noindex: PropTypes.bool
};

export default SEO; 