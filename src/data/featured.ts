import type { ImageMetadata } from "astro";
import bigExceptionsManufacturing from "@/assets/featured/big-exceptions-manufacturing.jpg";
import h1bCityJournal from "@/assets/featured/h1b-city-journal.jpg";
import manufacturingJobGains from "@/assets/featured/manufacturing-job-gains.jpg";
import { getAllWritings, type Writing, type WritingType } from "@/data/writings";

/** Number of cards in the Featured section on the home page. */
const FEATURED_COUNT = 2;

/**
 * Featured defaults to the most recent articles, so adding a new entry to
 * content/writings.yaml promotes it automatically — nothing to update here.
 *
 * To pin specific items instead, list their writings.yaml ids below (display
 * order follows this list). Leave the array empty for the automatic behaviour.
 *
 *   export const featuredOverride: string[] = ["city-journal-h1b", "rural-retirement"];
 */
export const featuredOverride: string[] = [];

/** Only these types are auto-featured; data projects are not treated as articles. */
const AUTO_FEATURE_TYPES: ReadonlySet<WritingType> = new Set<WritingType>(["paper", "writing"]);

/**
 * Cover images keyed by writings.yaml id — usually the article's own og:image,
 * downloaded into src/assets/featured/.
 *
 * This is optional: an article with no image here is still featured, its card
 * just renders text-only. So a new article never breaks the home page, but
 * adding its image here is what makes the card look right.
 */
const featuredImages: Record<string, { image: ImageMetadata; alt: string }> = {
	"big-exceptions-manufacturing-decline": {
		image: bigExceptionsManufacturing,
		alt: "Chart of U.S. manufacturing employment change by subsector",
	},
	"city-journal-h1b": {
		image: h1bCityJournal,
		alt: "President Trump at the NATO summit in Ankara",
	},
	"manufacturing-job-gains-fading": {
		image: manufacturingJobGains,
		alt: "County-level map of U.S. manufacturing employment growth",
	},
};

export interface FeaturedCardData {
	writing: Writing;
	image?: ImageMetadata | undefined;
	imageAlt?: string | undefined;
}

/** Resolves the Featured section: the override list if set, else the most recent articles. */
export async function getFeaturedWritings(): Promise<FeaturedCardData[]> {
	const allWritings = await getAllWritings();

	const selected = featuredOverride.length
		? featuredOverride.map((id) => {
				const writing = allWritings.find((w) => w.id === id);
				if (!writing) {
					throw new Error(
						`featured.ts: featuredOverride lists "${id}", which is not an id in content/writings.yaml`,
					);
				}
				return writing;
			})
		: allWritings.filter((w) => AUTO_FEATURE_TYPES.has(w.data.type)).slice(0, FEATURED_COUNT);

	return selected.map((writing) => {
		const cover = featuredImages[writing.id];
		return { writing, image: cover?.image, imageAlt: cover?.alt };
	});
}
