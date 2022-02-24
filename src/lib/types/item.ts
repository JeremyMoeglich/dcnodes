import type { SvelteComponent } from 'svelte';

const position_keys = ['x', 'y'] as const;

export type vector = Record<typeof position_keys[number], number>;

export interface connector {
	locator: () => vector;
	direction: vector;
}

export interface internal_item_type<Props extends Record<string, unknown> = Record<string, unknown>>
	extends item_type<Props> {
	update_fn: () => void;
	id: number;
	connectors: Record<string, connector>;
}

export interface connector_identifier {
	node_id: number;
	name: string;
}

export interface item_type<Props extends Record<string, unknown> = Record<string, unknown>> {
	component: typeof SvelteComponent;
	position?: vector;
	props?: Props;
	connections?: Record<string, connector_identifier>;
}
