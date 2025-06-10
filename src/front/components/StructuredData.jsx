import { Helmet } from 'react-helmet-async';

export const RestaurantStructuredData = () => {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Restaurant',
        name: 'El Mexicano Restaurant',
        image: [
            'https://elmexicano-restaurant.com/images/restaurant-front.jpg',
            'https://elmexicano-restaurant.com/images/restaurant-interior.jpg',
            'https://elmexicano-restaurant.com/images/menu-hero.jpg'
        ],
        '@id': 'https://elmexicano-restaurant.com',
        url: 'https://elmexicano-restaurant.com',
        telephone: '+55 1234 5678',
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Blvd. Valle de San Javier',
            addressLocality: 'Pachuca',
            addressRegion: 'Hidalgo',
            postalCode: '42086',
            addressCountry: 'MX'
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: 20.1010600,
            longitude: -98.7591312
        },
        servesCuisine: 'Mexican',
        priceRange: '$$',
        openingHoursSpecification: [
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: [
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday'
                ],
                opens: '08:00',
                closes: '22:30'
            }
        ],
        menu: 'https://elmexicano-restaurant.com/menu',
        acceptsReservations: 'True',
        hasMap: 'https://goo.gl/maps/...'
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
};

export const MenuItemStructuredData = ({ item }) => {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'MenuItem',
        name: item.name,
        description: item.description,
        offers: {
            '@type': 'Offer',
            price: item.price.replace('$', ''),
            priceCurrency: 'MXN'
        },
        image: item.image
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
};

export const BreadcrumbStructuredData = ({ items }) => {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `https://elmexicano-restaurant.com${item.path}`
        }))
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
}; 