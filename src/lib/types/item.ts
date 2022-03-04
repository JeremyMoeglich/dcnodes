import type { SvelteComponent } from 'svelte';

const position_keys = ['x', 'y'] as const;

export type vector = Record<typeof position_keys[number], number>;

export type connector_types = 'in' | 'out';

export type node_identifier = number;

export interface connector {
	locator: () => vector;
	direction: vector;
}

export interface parent_info_type {
	position: vector;
}

export interface passed_data {
	items: Record<node_identifier, item_type>;
	index: number;
	current_item: item_type;
	internal: internal_data;
	parent_info: parent_info_type;
}

export interface internal_data {
	update_fn: (name?: string) => void;
	connectors: Record<string, connector>;
	drag_value: number;
	paths: Record<string, Record<string, string>>;
}

export interface connector_identifier<T extends connector_types = connector_types> {
	index: node_identifier;
	name: string;
	type: T;
}

export interface item_type<Props extends Record<string, unknown> = Record<string, unknown>> {
	component: typeof SvelteComponent;
	position?: vector;
	props?: Props;
	connections?: Record<string, Set<connector_identifier<'in'>>>;
}
