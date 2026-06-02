import type { ReactNode } from "react";
import type { Language } from "../types";

/** Props for {@link Lang}. */
export interface LangProps {
	/** Content rendered when `selectedLang` is `"en"` (also the fallback). */
	en: ReactNode;
	/** Content rendered when `selectedLang` is `"am"`. */
	am: ReactNode;
	/** Content rendered when `selectedLang` is `"or"`; falls back to `en` when omitted. */
	or?: ReactNode;
	/** The active language. */
	selectedLang: Language;
}

/** Render one of the localized nodes depending on the selected language. */
const Lang = ({ en, am, or, selectedLang }: LangProps) => {
	const content =
		selectedLang === "am" ? am : selectedLang === "or" ? (or ?? en) : en;
	return <div>{content}</div>;
};

export default Lang;
