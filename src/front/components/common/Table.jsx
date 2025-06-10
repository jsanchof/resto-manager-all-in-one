import React from 'react';
import PropTypes from 'prop-types';
import { colors, typography, spacing, borderRadius } from '../../theme';

const Table = ({
    columns,
    data,
    onSort,
    sortColumn,
    sortDirection,
    className = '',
    striped = false,
    hoverable = true,
    compact = false,
}) => {
    const tableStyles = {
        width: '100%',
        borderCollapse: 'collapse',
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        backgroundColor: colors.neutral.white,
        fontSize: typography.fontSize.sm,
    };

    const thStyles = {
        padding: compact ? spacing.sm : spacing.md,
        textAlign: 'left',
        backgroundColor: colors.neutral.lightGray,
        color: colors.neutral.darkGray,
        fontWeight: typography.fontWeight.semibold,
        borderBottom: `1px solid ${colors.neutral.gray}`,
        cursor: onSort ? 'pointer' : 'default',
        userSelect: 'none',
    };

    const tdStyles = {
        padding: compact ? spacing.sm : spacing.md,
        borderBottom: `1px solid ${colors.neutral.lightGray}`,
        color: colors.neutral.black,
    };

    const trHoverStyles = hoverable ? {
        '&:hover': {
            backgroundColor: colors.neutral.background,
        },
    } : {};

    const getSortIcon = (columnId) => {
        if (columnId !== sortColumn) return '↕️';
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={tableStyles} className={className}>
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.id}
                                onClick={() => onSort && onSort(column.id)}
                                style={{
                                    ...thStyles,
                                    cursor: onSort ? 'pointer' : 'default',
                                }}
                            >
                                {column.label}
                                {onSort && (
                                    <span style={{ marginLeft: spacing.xs }}>
                                        {getSortIcon(column.id)}
                                    </span>
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr
                            key={row.id || rowIndex}
                            style={{
                                backgroundColor: striped && rowIndex % 2 === 1 ? colors.neutral.background : 'transparent',
                                ...trHoverStyles,
                            }}
                        >
                            {columns.map((column) => (
                                <td
                                    key={`${row.id || rowIndex}-${column.id}`}
                                    style={tdStyles}
                                >
                                    {column.render ? column.render(row) : row[column.id]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

Table.propTypes = {
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            render: PropTypes.func,
        })
    ).isRequired,
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    onSort: PropTypes.func,
    sortColumn: PropTypes.string,
    sortDirection: PropTypes.oneOf(['asc', 'desc']),
    className: PropTypes.string,
    striped: PropTypes.bool,
    hoverable: PropTypes.bool,
    compact: PropTypes.bool,
};

export default Table; 