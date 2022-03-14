import type { SvelteComponent } from 'svelte';

export interface vector {
	x: number;
	y: number;
}

export type connector_types = 'in' | 'out';
export type connection_name = string;
export type node_identifier = number;

export interface connector {
	get_location: () => vector;
	set_location: (v: vector) => void;
	get_direction: () => vector;
	set_direction: (v: vector) => void;
}

export interface parent_info_type {
	get_position: () => vector;
}

export interface passed_data {
	index: number;
	get_current_item: () => item_type;
	update_fn: (name?: string, type?: connector_types | 'both') => void;
	get_connectors: () => Record<string, connector>;
	get_drag_value: () => number;
	get_svg_paths: () => Record<string, Record<string, string>>;
	get_parent_info: () => parent_info_type;
	get_items: () => Record<node_identifier, item_type>;
}

export interface connector_identifier<T extends connector_types = connector_types> {
	index: node_identifier;
	name: string;
	type: T;
}

export interface item_type<Props extends Record<string, unknown> = Record<string, unknown>> {
	component: typeof SvelteComponent;
	get_position: () => vector;
	set_position: (v: vector) => void;
	get_props: () => Props;
	get_node_connections: () => Record<string, Set<connector_identifier<'in'>>>;
	get_position_connections: () => Record<string, Set<vector>>;
}
