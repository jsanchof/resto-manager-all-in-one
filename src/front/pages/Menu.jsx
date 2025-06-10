import React, { useEffect, useState } from "react";
import { Container, Card, Alert } from '../components/common';
import { colors, typography, spacing, borderRadius } from '../theme';
import SEO from '../components/SEO';

const MenuSection = ({ title, items }) => {
  const titleStyles = {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.black,
    marginBottom: spacing.lg,
  };

  const itemStyles = {
    display: 'flex',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  };

  const imageStyles = {
    height: '200px',
    width: '200px',
    objectFit: 'cover',
    borderRadius: borderRadius.md,
  };

  const contentStyles = {
    flex: 1,
  };

  const nameStyles = {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.black,
    marginBottom: spacing.xs,
  };

  const descriptionStyles = {
    fontSize: typography.fontSize.base,
    color: colors.neutral.darkGray,
    marginBottom: spacing.xs,
  };

  const priceStyles = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary.main,
  };

  return (
    <div id={title.toLowerCase()}>
      <h2 style={titleStyles}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(600px, 1fr))', gap: spacing.lg }}>
        {items.map((item) => (
          <div key={item.id} style={itemStyles}>
            <img
              src={item.url_img}
              alt={item.name}
              style={imageStyles}
            />
            <div style={contentStyles}>
              <h3 style={nameStyles}>{item.name}</h3>
              <p style={descriptionStyles}>{item.description}</p>
              <p style={priceStyles}>${item.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Menu = () => {
  const [dishes, setDishes] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [error, setError] = useState(null);

  const fetchDishes = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/productos?tipo=PLATO`);
      if (!response.ok) throw new Error("Ha ocurrido un error al obtener el menú");
      const data = await response.json();
      setDishes(data.items || []);
    } catch (error) {
      console.log(error);
      setError(error.message);
    }
  };

  const fetchDrinks = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/productos?tipo=BEBIDA`);
      if (!response.ok) throw new Error("Ha ocurrido un error al obtener el menú");
      const data = await response.json();
      setDrinks(data.items || []);
    } catch (error) {
      console.log(error);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchDishes();
    fetchDrinks();
  }, []);

  const menuCategories = [
    { id: 'appetizers', label: 'Appetizers' },
    { id: 'main', label: 'Main Dishes' },
    { id: 'desserts', label: 'Desserts' },
    { id: 'sodas', label: 'Sodas' },
    { id: 'natural', label: 'Natural Drinks' },
    { id: 'beers', label: 'Beers' },
    { id: 'spirits', label: 'Spirits' },
  ];

  const navStyles = {
    backgroundColor: colors.primary.main,
    padding: `${spacing.md} ${spacing.lg}`,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
  };

  const navLinkStyles = {
    color: colors.neutral.white,
    textDecoration: 'none',
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: colors.primary.dark,
    },
  };

  return (
    <>
      <SEO
        title="Menú | Auténtica Comida Mexicana"
        description="Explora nuestro menú de auténtica comida mexicana. Desde tacos y enchiladas hasta guacamole fresco y margaritas. Platos tradicionales preparados con ingredientes frescos."
        keywords="menu mexicano, tacos, enchiladas, guacamole, comida mexicana, restaurante mexicano, margaritas"
        canonicalUrl="https://elmexicano-restaurant.com/menu"
        ogImage="/images/menu-hero.jpg"
      />

      <Container maxWidth="xl">
        {error && (
          <Alert
            variant="error"
            title="Error"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        <Card>
          <nav style={navStyles}>
            <h1 style={{
              fontSize: typography.fontSize['3xl'],
              color: colors.neutral.white,
              marginBottom: spacing.md
            }}>
              Menú
            </h1>
            <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap' }}>
              {menuCategories.map((category) => (
                <a
                  key={category.id}
                  href={`#${category.id}`}
                  style={navLinkStyles}
                >
                  {category.label}
                </a>
              ))}
            </div>
          </nav>

          <div style={{ padding: spacing.xl }}>
            <MenuSection
              title="Appetizers"
              items={dishes.filter(dish => dish.type === "APPETIZER")}
            />
            <MenuSection
              title="Main Dishes"
              items={dishes.filter(dish => dish.type === "MAIN")}
            />
            <MenuSection
              title="Desserts"
              items={dishes.filter(dish => dish.type === "DESSERT")}
            />
            <MenuSection
              title="Sodas"
              items={drinks.filter(drink => drink.type === "SODA")}
            />
            <MenuSection
              title="Natural Drinks"
              items={drinks.filter(drink => drink.type === "NATURAL")}
            />
            <MenuSection
              title="Beers"
              items={drinks.filter(drink => drink.type === "BEER")}
            />
            <MenuSection
              title="Spirits"
              items={drinks.filter(drink => drink.type === "SPIRITS")}
            />
          </div>
        </Card>
      </Container>
    </>
  );
};