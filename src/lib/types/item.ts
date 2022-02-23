import type { SvelteComponentTyped } from 'svelte';

export interface position {
	x: number;
	y: number;
}

export interface internal_item_type extends item_type {
	update_fn: (name?: string) => never;
	id: number;
	locators: Record<string, () => position>;
}

export interface item_type {
	component: new (...args: unknown[]) => SvelteComponentTyped<Omit<item_type, 'component'>>;
	position?: position;
	props?: Record<string, unknown>;
	connections?: Array<{ node_id: number; input_name: string } | position>;
}
