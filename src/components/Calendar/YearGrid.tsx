import { useEffect, useRef } from "react";
import cn from "../../utils/cn";

/** Props for {@link YearGrid}. */
export interface YearGridProps {
	/** The year to highlight and scroll into view. */
	currentYear: number;
	/** First year to render (inclusive). Defaults to 1900. */
	startYear?: number;
	/** Last year to render (exclusive). Defaults to 2100. */
	endYear?: number;
	/** Return `true` to hide a year (e.g. outside min/max bounds). */
	isYearDisabled?: (year: number) => boolean;
	/** Called with the chosen year. */
	onSelect: (year: number) => void;
}

/**
 * A scrollable grid of selectable years, shared by the Ethiopian and Gregorian
 * pickers. Automatically scrolls the current year to the vertical center on mount.
 */
const YearGrid = ({
	currentYear,
	startYear = 1900,
	endYear = 2100,
	isYearDisabled,
	onSelect,
}: YearGridProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const currentYearRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = containerRef.current;
		const current = currentYearRef.current;
		if (!container || !current) return;
		container.scrollTop =
			current.offsetTop - container.offsetHeight / 2 + current.offsetHeight / 2;
	}, [currentYear]);

	const years = Array.from(
		{ length: endYear - startYear },
		(_, i) => startYear + i,
	);

	return (
		<div
			className="yearsGridContainer"
			ref={containerRef}
			style={{ overflowY: "auto", maxHeight: "260px" }}
		>
			<div
				className="yearsGrid"
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(4, 1fr)",
					gap: "10px",
				}}
			>
				{years.map((year) => {
					if (isYearDisabled?.(year)) return null;
					const isCurrentYear = currentYear === year;
					return (
						<div
							key={year}
							ref={isCurrentYear ? currentYearRef : null}
							onClick={(e) => {
								e.stopPropagation();
								onSelect(year);
							}}
							className={cn("yearItem", isCurrentYear ? "backgroundBlue" : "")}
							style={{ padding: "5px", textAlign: "center" }}
						>
							{year}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default YearGrid;
