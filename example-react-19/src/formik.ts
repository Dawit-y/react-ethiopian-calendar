import type { FocusEvent } from "react";

/**
 * The minimal subset of a Formik instance the example pickers rely on. Using a
 * structural type keeps the demo components decoupled from Formik's full generic
 * surface while staying type-safe.
 */
export interface FormikLike {
	values: Record<string, string>;
	errors: Record<string, string | undefined>;
	touched: Record<string, boolean | undefined>;
	setFieldValue: (field: string, value: string, shouldValidate?: boolean) => void;
	handleBlur: (e: FocusEvent) => void;
}
