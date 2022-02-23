import type { SvelteComponentTyped } from 'svelte';

export interface position {
	x: number;
	y: number;
}

export interface item_type {
	component: new (...args: unknown[]) => SvelteComponentTyped<Omit<item_type, 'component'>>;
	position?: position;
	props?: Record<string, unknown>;
	connections?: Array<{ node_id: number; input_name: string } | position>;
	update_fn?: (name?: string) => never;
}
