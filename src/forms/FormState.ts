import { create } from "zustand"

/**
 * Validator:
 * Return true if valid, or a string message if invalid
 */
export type Validator<T> = (state: T) => true | string

/**
 * Map of field -> list of validators
 */
export type ValidationMap<T> = Partial<Record<keyof T, Validator<T>[]>>

/**
 * Map of field -> list of error messages
 */
export type ErrorMap<T> = Partial<Record<keyof T, string[]>>

/**
 * Individual field updater
 */
export type FormFieldUpdateCallback<T> = <K extends keyof T>(field: K, value: T[K]) => void

/**
 * Full fieldset updater
 */
export type FormFullUpdateCallback<T> = (values: Partial<T>) => void

/**
 * Generic form state interface
 */
export interface FormState<T> {
	setField: <K extends keyof T>(field: K, value: T[K]) => void
	setAll: (values: Partial<T>) => void
	getPostRequest: () => T
	reset: () => void

	isValid: boolean
	errors: ErrorMap<T>
}

/**
 * Generic Zustand form factory with validation
 */
export function createFormState<T extends object>(initialState: T, validations: ValidationMap<T> = {}) {
	return create<FormState<T> & T>((set, get) => ({
		...initialState,

		errors: {},

		getPostRequest: () => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { setField, setAll, getPostRequest, reset, isValid, errors, ...fields } = get()

			return fields as T
		},

		isValid: true,

		reset: () =>
			set((state) => ({
				...state,
				...initialState,
				errors: {},
				isValid: true,
			})),

		setAll: (values) =>
			set((state) => {
				const next = {
					...state,
					...values,
				}

				const { errors, isValid } = runFormValidation(next as T, validations)

				return {
					...next,
					errors,
					isValid,
				}
			}),

		setField: (field, value) =>
			set((state) => {
				const next = {
					...state,
					[field]: value,
				}

				const { errors, isValid } = runFormValidation(next as T, validations)

				return {
					...next,
					errors,
					isValid,
				}
			}),
	}))
}

function runFormValidation<T extends object>(
	state: T,
	validations: ValidationMap<T>
): { errors: ErrorMap<T>; isValid: boolean } {
	const errors: ErrorMap<T> = {}
	let isValid = true

	for (const field in validations) {
		const rules = validations[field as keyof T] ?? []
		const messages: string[] = []

		for (const rule of rules) {
			const result = rule(state)
			if (result !== true) {
				messages.push(result)
			}
		}

		if (messages.length > 0) {
			errors[field as keyof T] = messages
			isValid = false
		}
	}

	return { errors, isValid }
}
