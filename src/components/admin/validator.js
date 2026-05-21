class Validator {
    errors = {};

    validate(data, rules) {
        this.errors = {};
        Object.keys(rules).forEach((field) => {
            const fieldRule = rules[field];
            const fieldData = data[field];
            if (!fieldData || (typeof fieldData === 'string' && fieldData.trim() === '')) {
                return;
            }
            const trimmedValue = typeof fieldData === 'string' ? fieldData.trim() : fieldData;
            this.checkRequired(field, trimmedValue, fieldRule);
            this.checkPattern(field, trimmedValue, fieldRule);
            this.checkNumber(field, trimmedValue, fieldRule);
            this.checkMinLength(field, trimmedValue, fieldRule);
            this.checkMaxLength(field, trimmedValue, fieldRule);
            this.checkEnum(field, trimmedValue, fieldRule);
            this.checkEmail(field, trimmedValue, fieldRule);
            this.checkDate(field, trimmedValue, fieldData);
            this.checkCustom(field, trimmedValue, fieldRule);
        })

        return {
            isValue: Object.keys(this.errors).length === 0,
            errors: this.errors
        };
    }

    checkRequired(field, value, rules) {
        if (rules.required) {
            if (!value || (typeof value === 'string' && value.trim() === "")) {
                this.errors[field] = rules?.message || `${field} is required`;
            }
        }
    }

    checkMinLength(field, value, rules) {
        if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
            this.errors[field] = rules?.message || `${field} must be atleast ${rules.minLength} characters.`
        }
    }

    checkMaxLength(field, value, rules) {
        if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
            this.errors[field] = rules?.message || `${field} must be atleast ${rules.maxLength} characters.`
        }
    }

    checkPattern(field, value, rules) {
        if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
            this.errors[field] = rules?.message || `${field} format is invalid.`
        }
    }

    checkEmail(field, value, rules) {
        if (rules.email && typeof value === 'string') {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(value)) {
                this.errors[field] = rules?.message || `Invalid email format.`
            }
        }
    }

    checkDate(field, value, rules) {
        if (rules.type === 'date') {
            const dateValue = new Date(value)
            if (isNaN(dateValue.getTime())) {
                this.errors[field] = rules.message || `${field} must be a valid date`;
                return;
            }

            if (rules.minDate && dateValue < rules.minDate) {
                this.errors[field] = rules.message || `${field} must be after ${rules.minDate.toLocaleDateString()}`;
                return;
            }

            if (rules.maxDate && dateValue > rules.maxDate) {
                this.errors[field] = rules.message || `${field} cannot be in the future`;
            }
        }
    }

    checkNumber(field, value, rules) {
        if (rules.type === 'number') {
            const numberValue = Number(value);

            if (isNaN(numberValue)) {
                this.errors[field] = rules?.message || `${field} must be a number.`
                return;
            }

            if (rules.min !== undefined && value < rules.min) {
                this.errors[field] = rules?.message || `${field} must be at least ${rules.min}`
                return;
            }

            if (rules.max !== undefined && value > rules.max) {
                this.errors[field] = rules.message || `${field} must be at most ${rules.max}`;
                return;
            }

            if (rules.integer && !Number.isInteger(numValue)) {
                this.errors[field] = rules.message || `${field} must be an integer`;
            }
        }
    }

    checkEnum(field, value, rules) {
        if (rules.enum) {

            const normalizedValue = typeof value === 'string' ? value.toLowerCase() : value;

            const normalizedEnum = rules.enum.map((e) => {
                return typeof e === 'string' ? e.toLowerCase() : e
            })

            if (!normalizedEnum.includes(normalizedValue)) {
                this.errors[field] = rules?.message || `${field} must be one of: ${rules.enum.join(', ')}`
            }
        }
    }

    checkCustom(field, value, rules) {
        if (rules.custom && typeof rules.custom === 'function') {
            const customError = rules.custom(value, field)

            if (customError) {
                this.errors[field] = customError;
            }
        }
    }

}

export default new Validator();