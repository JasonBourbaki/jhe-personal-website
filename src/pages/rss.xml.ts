import rss from "@astrojs/rss";
import { getAllWritings } from "@/data/writings";
import { siteConfig } from "@/site.config";

export const GET = async () => {
	const writings = await getAllWritings();

	return rss({
		title: siteConfig.title,
		description: siteConfig.description,
		site: import.meta.env.SITE,
		items: writings.map((writing) => ({
			title: writing.data.title,
			description: `${writing.data.authors.join(", ")} — ${writing.data.venue}`,
			pubDate: writing.data.date,
			link: writing.data.url,
		})),
	});
};
