import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";
import { parse as parseYaml } from "yaml";

function removeDupsAndLowerCase(array: string[]) {
	return [...new Set(array.map((str) => str.toLowerCase()))];
}

const titleSchema = z.string().max(60);

const baseSchema = z.object({
	title: titleSchema,
});

/**
 * Blog machinery kept from the theme (hidden from nav for now — revive by
 * adding a menu link in site.config.ts and dropping .md files in content/posts/).
 */
const post = defineCollection({
	loader: glob({ base: "./content/posts", pattern: "**/*.{md,mdx}" }),
	schema: ({ image }) =>
		baseSchema.extend({
			description: z.string(),
			coverImage: z
				.object({
					alt: z.string(),
					src: image(),
				})
				.optional(),
			draft: z.boolean().default(false),
			ogImage: z.string().optional(),
			tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
			publishDate: z
				.string()
				.or(z.date())
				.transform((val) => new Date(val)),
			updatedDate: z
				.string()
				.optional()
				.transform((str) => (str ? new Date(str) : undefined)),
			pinned: z.boolean().default(false),
		}),
});

const tag = defineCollection({
	loader: glob({ base: "./content/tags", pattern: "**/*.{md,mdx}" }),
	schema: z.object({
		title: titleSchema.optional(),
		description: z.string().optional(),
	}),
});

/**
 * Externally published writings, papers, and data projects.
 * One YAML entry per item — see content/writings.yaml.
 */
const writing = defineCollection({
	loader: file("./content/writings.yaml", { parser: (text) => parseYaml(text) }),
	schema: z.object({
		title: z.string(),
		authors: z.array(z.string()).min(1),
		venue: z.string(),
		date: z.coerce.date(),
		// Shown verbatim instead of the formatted date when precision is unknown (e.g. "2025")
		displayDate: z.string().optional(),
		url: z.url(),
		github: z.url().optional(),
		type: z.enum(["paper", "writing", "data-project"]),
	}),
});

/**
 * Press citations, quotes, and other coverage.
 * One YAML entry per item — see content/mentions.yaml.
 */
const mention = defineCollection({
	loader: file("./content/mentions.yaml", { parser: (text) => parseYaml(text) }),
	schema: z.object({
		outlet: z.string(),
		title: z.string(),
		date: z.coerce.date(),
		displayDate: z.string().optional(),
		url: z.url(),
		// How the piece mentions me — shown as a muted line under the citation
		context: z.string().optional(),
	}),
});

export const collections = { post, tag, writing, mention };
