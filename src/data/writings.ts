import { type CollectionEntry, getCollection } from "astro:content";

export type Writing = CollectionEntry<"writing">;
export type Mention = CollectionEntry<"mention">;
export type WritingType = Writing["data"]["type"];

export const writingTypeLabels: Record<WritingType, string> = {
	paper: "Papers",
	writing: "Writings",
	"data-project": "Data Projects",
};

/** Display order of sections on the writings page */
export const writingTypeOrder: WritingType[] = ["paper", "writing", "data-project"];

function byDateDesc(a: { data: { date: Date } }, b: { data: { date: Date } }) {
	return b.data.date.getTime() - a.data.date.getTime();
}

/** All writings, newest first */
export async function getAllWritings(): Promise<Writing[]> {
	return (await getCollection("writing")).sort(byDateDesc);
}

/** All media mentions, newest first */
export async function getAllMentions(): Promise<Mention[]> {
	return (await getCollection("mention")).sort(byDateDesc);
}

/** Group entries by publication year, returned as [year, entries][] newest year first */
export function groupByYear<T extends { data: { date: Date } }>(entries: T[]): [string, T[]][] {
	const groups = new Map<string, T[]>();
	for (const entry of entries) {
		const year = entry.data.date.getFullYear().toString();
		groups.set(year, [...(groups.get(year) ?? []), entry]);
	}
	return [...groups.entries()].sort((a, b) => Number(b[0]) - Number(a[0]));
}
