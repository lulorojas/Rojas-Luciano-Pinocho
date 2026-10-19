const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isBlank = (value) => value === undefined || value === null || String(value).trim() === '';

/**
 * Valida los valores de un formulario según la configuración de sus campos.
 * Devuelve un objeto { nombreCampo: 'mensaje' } (vacío si todo es válido).
 * Cada campo admite: required, type, min, validate(value, values).
 */
export function validateFields(fields, values) {
    const errors = {};

    for (const field of fields) {
        const value = values[field.name];

        if (field.required && isBlank(value)) {
            errors[field.name] = `${field.label} es obligatorio`;
            continue;
        }
        if (isBlank(value)) continue;

        if (field.type === 'email' && !EMAIL_REGEX.test(value)) {
            errors[field.name] = 'Ingresá un email válido';
        } else if (field.type === 'number' && Number.isNaN(Number(value))) {
            errors[field.name] = `${field.label} debe ser un número`;
        } else if (field.type === 'number' && field.min !== undefined && Number(value) < field.min) {
            errors[field.name] = `${field.label} debe ser como mínimo ${field.min}`;
        } else if (field.validate) {
            const message = field.validate(value, values);
            if (message) errors[field.name] = message;
        }
    }

    return errors;
}
