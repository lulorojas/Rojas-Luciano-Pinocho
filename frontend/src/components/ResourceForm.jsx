import { useRef, useState } from 'react';
import FormField from './ui/FormField.jsx';
import Button from './ui/Button.jsx';
import { validateFields } from '../utils/validators.js';

/** Formulario dirigido por la configuración de campos, con validación al enviar. */
export default function ResourceForm({
    fields,
    initialValues,
    submitLabel = 'Guardar',
    submitting,
    onSubmit,
    onCancel,
    block = false,
    showLegend = true,
}) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const formRef = useRef(null);

    const handleChange = (event) => {
        const { name, type, checked, value } = event.target;
        setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
        setErrors((current) => ({ ...current, [name]: undefined }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const found = validateFields(fields, values);
        setErrors(found);

        if (Object.keys(found).length > 0) {
            // Espera al re-render para que el campo inválido ya tenga aria-invalid
            setTimeout(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus(), 0);
            return;
        }
        onSubmit(values);
    };

    return (
        <form ref={formRef} className="form" onSubmit={handleSubmit} noValidate>
            <div className="form__grid">
                {fields.map((field, index) => (
                    <FormField
                        key={field.name}
                        label={field.label}
                        name={field.name}
                        type={field.type}
                        required={field.required}
                        hint={field.hint}
                        options={field.options}
                        placeholder={field.placeholder}
                        data-autofocus={index === 0 ? '' : undefined}
                        min={field.min}
                        step={field.step}
                        value={values[field.name] ?? ''}
                        error={errors[field.name]}
                        onChange={handleChange}
                    />
                ))}
            </div>
            {showLegend && <p className="form__legend"><span aria-hidden="true">*</span> Campo obligatorio</p>}
            <div className={`form__actions ${block ? 'form__actions--block' : ''}`}>
                {onCancel && <Button variant="secondary" onClick={onCancel} disabled={submitting}>Cancelar</Button>}
                <Button type="submit" loading={submitting}>{submitLabel}</Button>
            </div>
        </form>
    );
}
