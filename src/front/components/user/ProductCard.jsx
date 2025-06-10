import React from "react";
import { colors, typography, spacing, borderRadius } from '../../theme';

function ProductCard({ producto, onAgregar }) {
  const cardStyles = {
    border: 'none',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    }
  };

  const imageStyles = {
    height: '200px',
    objectFit: 'cover',
    borderRadius: `${borderRadius.md} ${borderRadius.md} 0 0`,
  };

  const titleStyles = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.black,
    marginBottom: spacing.xs,
  };

  const priceStyles = {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
    marginBottom: spacing.md,
  };

  const buttonStyles = {
    backgroundColor: colors.primary.main,
    color: colors.neutral.white,
    border: 'none',
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: borderRadius.md,
    fontWeight: typography.fontWeight.medium,
    transition: 'background-color 0.2s',
    width: '100%',
    '&:hover': {
      backgroundColor: colors.primary.dark,
    }
  };

  return (
    <div className="card h-100 shadow-sm" style={cardStyles}>
      <img
        src={producto.imagen || "https://picsum.photos/200/300"}
        className="card-img-top"
        alt={producto.nombre}
        style={imageStyles}
      />
      <div className="card-body" style={{ padding: spacing.lg }}>
        <h5 style={titleStyles}>{producto.nombre}</h5>
        <p style={priceStyles}>${producto.precio.toFixed(2)}</p>
        <p style={{
          fontSize: typography.fontSize.base,
          color: colors.neutral.darkGray,
          marginBottom: spacing.lg,
        }}>
          {producto.descripcion}
        </p>
        <button
          className="btn"
          style={buttonStyles}
          onClick={onAgregar}
        >
          Add to Order
        </button>
      </div>
    </div>
  );
}

export default ProductCard;