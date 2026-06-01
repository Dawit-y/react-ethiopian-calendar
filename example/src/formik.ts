import type { FocusEvent } from "react";

/** Minimal structural shape of the Formik instance used by the demo pickers. */
export interface FormikLike {
	values: Record<string, string>;
	errors: Record<string, string | undefined>;
	touched: Record<string, boolean | undefined>;
	setFieldValue: (field: string, value: string, shouldValidate?: boolean) => void;
	handleBlur: (e: FocusEvent) => void;
}
