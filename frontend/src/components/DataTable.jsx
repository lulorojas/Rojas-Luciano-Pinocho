import { useEffect, useRef, useState } from 'react';
import Icon from './ui/Icon.jsx';
import { cellText, sortValue } from '../utils/tableData.js';

/**
 * Tabla genérica con orden por columna.
 * columns: [{ key, header, render?(row), align?: 'right', sortBy?: 'raw' | fn(row), sortable?: false }]
 * actions(row) devuelve los controles de la última columna.
 *
 * Los roles ARIA son explícitos porque en móvil la tabla se muestra como tarjetas (display:block),
 * y algunos navegadores descartan la semántica de tabla al cambiar el display.
 */
export default function DataTable({ caption, columns, rows, actions }) {
    const [sort, setSort] = useState(null); // { key, direction: 'asc' | 'desc' }
    const wrapperRef = useRef(null);
    const [scrollable, setScrollable] = useState(false);

    // La región solo entra en el orden de tabulación si realmente hay scroll horizontal (WCAG 2.1.1)
    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return undefined;
        const measure = () => setScrollable(wrapper.scrollWidth > wrapper.clientWidth + 1);
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(wrapper);
        return () => observer.disconnect();
    }, [rows, columns]);

    const toggleSort = (key) => {
        setSort((current) => {
            if (current?.key !== key) return { key, direction: 'asc' };
            if (current.direction === 'asc') return { key, direction: 'desc' };
            return null; // tercer clic: vuelve al orden original
        });
    };

    const sortColumn = columns.find((column) => column.key === sort?.key);
    const sortedRows = sortColumn
        ? [...rows].sort((a, b) => {
            const first = sortValue(sortColumn, a);
            const second = sortValue(sortColumn, b);
            const result = typeof first === 'number' && typeof second === 'number'
                ? first - second
                : String(first).localeCompare(String(second), 'es', { numeric: true, sensitivity: 'base' });
            return sort.direction === 'asc' ? result : -result;
        })
        : rows;

    return (
        <div
            ref={wrapperRef}
            className="table-wrapper"
            role="region"
            aria-label={caption}
            tabIndex={scrollable ? 0 : undefined}
        >
            <table className="table" role="table">
                <caption className="sr-only">{caption}</caption>
                <thead role="rowgroup">
                    <tr role="row">
                        {columns.map((column) => {
                            const sortable = column.sortable !== false;
                            const active = sort?.key === column.key;
                            const ariaSort = active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined;
                            return (
                                <th
                                    key={column.key}
                                    scope="col"
                                    role="columnheader"
                                    aria-sort={sortable ? (ariaSort ?? 'none') : undefined}
                                    className={column.align === 'right' ? 'is-right' : undefined}
                                >
                                    {sortable ? (
                                        <button type="button" className="sort-button" onClick={() => toggleSort(column.key)}>
                                            {column.header}
                                            <Icon name={active ? (sort.direction === 'asc' ? 'sort-up' : 'sort-down') : 'sort'} size={14} />
                                        </button>
                                    ) : column.header}
                                </th>
                            );
                        })}
                        {actions && <th scope="col" role="columnheader"><span className="sr-only">Acciones</span></th>}
                    </tr>
                </thead>
                <tbody role="rowgroup">
                    {sortedRows.map((row) => (
                        <tr key={row.id} role="row">
                            {columns.map((column) => (
                                <td
                                    key={column.key}
                                    role="cell"
                                    data-label={column.header}
                                    className={column.align === 'right' ? 'is-right' : undefined}
                                >
                                    {column.render ? column.render(row) : (cellText(column, row) || '—')}
                                </td>
                            ))}
                            {actions && (
                                <td role="cell" data-label="Acciones" className="table__actions-cell">
                                    <div className="table__actions">{actions(row)}</div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
