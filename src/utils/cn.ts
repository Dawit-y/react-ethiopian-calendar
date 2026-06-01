/** A value that may appear in a `cn(...)` call. Falsy values are dropped. */
export type ClassValue = string | false | null | undefined;

/**
 * Join truthy class names into a single space-separated string.
 *
 * @example
 * cn("a", false && "b", cond ? "c" : null) // => "a c" (when cond is true)
 */
export default function cn(...classes: ClassValue[]): string {
	return classes.filter(Boolean).join(" ");
}
