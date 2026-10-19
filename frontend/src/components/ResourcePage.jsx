import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useResource } from '../hooks/useResource.js';
import { useToast } from '../hooks/useToast.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { matchesQuery } from '../utils/tableData.js';
import PageHeader from './layout/PageHeader.jsx';
import DataTable from './DataTable.jsx';
import ResourceForm from './ResourceForm.jsx';
import Button from './ui/Button.jsx';
import IconButton from './ui/IconButton.jsx';
import Icon from './ui/Icon.jsx';
import Modal from './ui/Modal.jsx';
import ConfirmDialog from './ui/ConfirmDialog.jsx';
import Spinner from './ui/Spinner.jsx';
import EmptyState from './ui/EmptyState.jsx';
import ErrorState from './ui/ErrorState.jsx';

const NO_LOOKUPS = {};

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

// Valores iniciales: los del registro al editar, o el defaultValue de cada campo al crear
function buildInitialValues(fields, item) {
    return Object.fromEntries(fields.map((field) => {
        if (!item) return [field.name, field.defaultValue ?? (field.type === 'checkbox' ? false : '')];
        const value = item[field.name];
        if (field.type === 'checkbox') return [field.name, Boolean(value)];
        return [field.name, value === null || value === undefined ? '' : String(value)];
    }));
}

/**
 * Pantalla CRUD reutilizable: listado con búsqueda, filtros y orden, alta/edición en modal,
 * eliminación con confirmación y notificaciones de éxito/error.
 *
 * Props de configuración:
 * - service: { getAll, create, update, remove } (funciones de services/)
 * - lookups: { clave: fetcher } datos auxiliares (selects, nombres relacionados)
 * - columns(lookups), fields(lookups, registro|null), filters(lookups)
 * - extraActions(item, lookups): acciones de fila adicionales
 *   { label, run, success, hidden?, confirm?: { title, message, confirmLabel } }
 * - itemLabel(item, lookups): nombre del registro para mensajes y lectores de pantalla
 *
 * Los filtros se pueden precargar desde la URL (/cuotas?estado=vencida).
 */
export default function ResourcePage({
    title,
    description,
    singular,
    article = 'o',
    service,
    lookups = NO_LOOKUPS,
    columns,
    fields,
    filters,
    extraActions,
    itemLabel,
    emptyMessage,
}) {
    useDocumentTitle(title);
    const toast = useToast();
    const [searchParams] = useSearchParams();

    // target: 'new' | registro. open separa "se pidió cerrar" de "ya se desmontó" para poder animar la salida.
    const [form, setForm] = useState({ target: null, open: false });
    const [confirm, setConfirm] = useState(null); // { open, title, message, confirmLabel, variant, run, success }
    const [busy, setBusy] = useState(false);
    const [query, setQuery] = useState('');
    const [filterValues, setFilterValues] = useState(() => Object.fromEntries(searchParams));

    const load = useCallback(async () => {
        const keys = Object.keys(lookups);
        const [items, ...related] = await Promise.all([service.getAll(), ...keys.map((key) => lookups[key]())]);
        return { items, lookups: Object.fromEntries(keys.map((key, index) => [key, related[index]])) };
    }, [service, lookups]);

    const { data, loading, error, reload } = useResource(load);

    const ctx = data?.lookups ?? NO_LOOKUPS;
    const done = (verb) => `${capitalize(singular)} ${verb}${article === 'a' ? 'a' : 'o'} correctamente`;
    const label = (item) => itemLabel?.(item, ctx);

    // Ejecuta una operación contra la API y notifica el resultado de forma uniforme
    const runOperation = async (operation, successMessage) => {
        setBusy(true);
        try {
            await operation();
            toast.success(successMessage);
            reload();
            return true;
        } catch (err) {
            toast.error(err.message);
            return false;
        } finally {
            setBusy(false);
        }
    };

    const openForm = (target) => setForm({ target, open: true });
    const closeForm = () => setForm((current) => ({ ...current, open: false }));

    const askConfirm = (config) => setConfirm({ variant: 'danger', ...config, open: true });
    const closeConfirm = () => setConfirm((current) => current && { ...current, open: false });

    const handleSave = async (values) => {
        const isNew = form.target === 'new';
        const saved = await runOperation(
            () => (isNew ? service.create(values) : service.update(form.target.id, values)),
            done(isNew ? 'cread' : 'actualizad'),
        );
        if (saved) closeForm();
    };

    const handleConfirm = async () => {
        const ok = await runOperation(confirm.run, confirm.success);
        if (ok) closeConfirm();
    };

    const requestDelete = (item) => askConfirm({
        title: `Eliminar ${singular}`,
        message: `¿Seguro que querés eliminar ${label(item) ? `"${label(item)}"` : `est${article === 'a' ? 'a' : 'e'} ${singular}`}? Esta acción no se puede deshacer.`,
        confirmLabel: 'Eliminar',
        run: () => service.remove(item.id),
        success: done('eliminad'),
    });

    const runAction = (action, item) => {
        if (!action.confirm) {
            runOperation(action.run, action.success);
            return;
        }
        askConfirm({
            title: action.confirm.title,
            message: action.confirm.message(label(item)),
            confirmLabel: action.confirm.confirmLabel ?? action.label,
            run: action.run,
            success: action.success,
        });
    };

    const columnList = data ? columns(ctx) : [];
    const activeFilters = data && filters ? filters(ctx) : [];
    const rows = (data?.items ?? []).filter((item) => (
        matchesQuery(columnList, item, query)
        && activeFilters.every((filter) => {
            const selected = filterValues[filter.name];
            return !selected || filter.match(item, selected);
        })
    ));
    const hasActiveRefinement = query.trim() !== '' || activeFilters.some((filter) => filterValues[filter.name]);
    const clearRefinements = () => {
        setQuery('');
        setFilterValues({});
    };

    // fields recibe el registro que se edita (null al crear) para campos que aplican solo al alta
    const formFields = data ? fields(ctx, form.target === 'new' ? null : form.target) : [];
    const newLabel = `Nuev${article} ${singular}`;

    let content;
    if (loading && !data) {
        content = <Spinner label={`Cargando ${title.toLowerCase()}…`} />;
    } else if (error && !data) {
        content = <ErrorState message={error} onRetry={reload} />;
    } else if (data.items.length === 0) {
        content = (
            <EmptyState
                title={`Todavía no hay ${title.toLowerCase()}`}
                message={emptyMessage ?? `Creá ${article === 'a' ? 'la primera' : 'el primer'} ${singular} para empezar.`}
                action={<Button onClick={() => openForm('new')}>{newLabel}</Button>}
            />
        );
    } else {
        content = (
            <>
                <div className="toolbar" role="search" aria-label={`Buscar y filtrar ${title.toLowerCase()}`}>
                    <div className="toolbar__filter toolbar__search">
                        <label htmlFor="busqueda">Buscar</label>
                        <div className="search-field">
                            <Icon name="search" size={18} />
                            <input
                                id="busqueda"
                                type="search"
                                className="field__control"
                                placeholder={`Buscar en ${title.toLowerCase()}`}
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                            />
                        </div>
                    </div>
                    {activeFilters.map((filter) => (
                        <div className="toolbar__filter" key={filter.name}>
                            <label htmlFor={`filter-${filter.name}`}>{filter.label}</label>
                            <select
                                id={`filter-${filter.name}`}
                                className="field__control"
                                value={filterValues[filter.name] ?? ''}
                                onChange={(event) => setFilterValues((current) => ({ ...current, [filter.name]: event.target.value }))}
                            >
                                <option value="">Todos</option>
                                {filter.options.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
                <p className="result-count" role="status">
                    {rows.length} de {data.items.length} {data.items.length === 1 ? singular : title.toLowerCase()}
                </p>
                {rows.length === 0 ? (
                    <EmptyState
                        title="Sin resultados"
                        message="Ningún registro coincide con la búsqueda o los filtros elegidos."
                        action={hasActiveRefinement && <Button variant="secondary" onClick={clearRefinements}>Limpiar búsqueda y filtros</Button>}
                    />
                ) : (
                    <DataTable
                        caption={`Listado de ${title.toLowerCase()}`}
                        columns={columnList}
                        rows={rows}
                        actions={(item) => (
                            <>
                                {(extraActions?.(item, ctx) ?? []).filter((action) => !action.hidden).map((action) => (
                                    <Button
                                        key={action.label}
                                        size="sm"
                                        variant={action.primary ? 'secondary' : 'ghost'}
                                        disabled={busy}
                                        onClick={() => runAction(action, item)}
                                    >
                                        {action.label}
                                        <span className="sr-only"> {label(item)}</span>
                                    </Button>
                                ))}
                                <Button size="sm" variant="ghost" onClick={() => openForm(item)}>
                                    Editar<span className="sr-only"> {label(item)}</span>
                                </Button>
                                <IconButton
                                    icon="trash"
                                    tone="danger"
                                    label={`Eliminar ${label(item) ?? singular}`}
                                    onClick={() => requestDelete(item)}
                                />
                            </>
                        )}
                    />
                )}
            </>
        );
    }

    return (
        <>
            <PageHeader
                title={title}
                description={description}
                action={data && <Button onClick={() => openForm('new')}>{newLabel}</Button>}
            />
            <div aria-busy={loading}>{content}</div>

            {form.target && (
                <Modal
                    title={form.target === 'new' ? newLabel : `Editar ${singular}`}
                    open={form.open}
                    dismissible={!busy}
                    closeOnBackdrop={false}
                    onClose={closeForm}
                    onExited={() => setForm({ target: null, open: false })}
                >
                    <ResourceForm
                        fields={formFields}
                        initialValues={buildInitialValues(formFields, form.target === 'new' ? null : form.target)}
                        submitting={busy}
                        onSubmit={handleSave}
                        onCancel={closeForm}
                    />
                </Modal>
            )}

            {confirm && (
                <ConfirmDialog
                    title={confirm.title}
                    message={confirm.message}
                    confirmLabel={confirm.confirmLabel}
                    variant={confirm.variant}
                    open={confirm.open}
                    loading={busy}
                    onConfirm={handleConfirm}
                    onCancel={closeConfirm}
                    onExited={() => setConfirm(null)}
                />
            )}
        </>
    );
}
