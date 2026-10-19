import { useId } from 'react';

/**
 * Campo de formulario accesible: asocia label, control, ayuda y mensaje de error.
 * Soporta input (text, number, email, date, time, month), select, textarea y checkbox.
 */
export default function FormField({
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    hint,
    required = false,
    options = [],
    placeholder,
    ...props
}) {
    const id = useId();
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;
    const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

    const controlProps = {
        id,
        name,
        onChange,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
        'aria-required': required || undefined,
        ...props,
    };

    let control;
    if (type === 'select') {
        control = (
            <select {...controlProps} value={value} className="field__control">
                <option value="">{placeholder ?? 'Elegí una opción'}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        );
    } else if (type === 'textarea') {
        control = <textarea {...controlProps} value={value} rows={3} placeholder={placeholder} className="field__control" />;
    } else if (type === 'checkbox') {
        control = <input {...controlProps} type="checkbox" checked={Boolean(value)} className="field__checkbox" />;
    } else {
        control = <input {...controlProps} type={type} value={value} placeholder={placeholder} className="field__control" />;
    }

    return (
        <div className={`field ${type === 'checkbox' ? 'field--checkbox' : ''} ${error ? 'field--error' : ''}`}>
            {type === 'checkbox' ? (
                <>
                    {control}
                    <label htmlFor={id}>{label}</label>
                </>
            ) : (
                <>
                    <label htmlFor={id}>
                        {label}
                        {required && <span className="field__required" aria-hidden="true"> *</span>}
                    </label>
                    {control}
                </>
            )}
            {hint && <p id={hintId} className="field__hint">{hint}</p>}
            {error && <p id={errorId} className="field__error">{error}</p>}
        </div>
    );
}
