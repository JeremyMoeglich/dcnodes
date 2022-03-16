import type { SvelteComponent } from 'svelte';

export interface vector {
	x: number;
	y: number;
}

export type connector_types = 'in' | 'out';
export type connection_name = string;
export type node_identifier = number;
export type node_connections = Record<string, Set<connector_identifier<'in'>>>;
export type position_connections = Record<string, Set<vector>>;

export interface connector {
	position: vector;
	direction: vector;
}

export interface connector_refrence {
	get_location: () => vector;
	set_location: (v: vector) => void;
	get_direction: () => vector;
	set_direction: (v: vector) => void;
}

export interface connector_identifier<T extends connector_types = connector_types> {
	index: node_identifier;
	name: string;
	type: T;
}

export interface item_type<Props extends Record<string, unknown> = Record<string, unknown>> {
	component: typeof SvelteComponent;
	position: vector;
	props: Props;
	node_connections: node_connections;
	position_connections: position_connections;
}

export interface item_type_refrence<
	Props extends Record<string, unknown> = Record<string, unknown>
> {
	get_component: () => typeof SvelteComponent;
	set_component: (component: typeof SvelteComponent) => void;
	get_position: () => vector;
	set_position: (v: vector) => void;
	get_props: () => Props;
	get_node_connections: () => node_connections;
	get_position_connections: () => position_connections;
}

export interface parent_info {
	position: vector;
}

export interface data {
	readonly index: number;
	item: item_type;
	svg_paths: Record<string, Record<string, string>>;
	drag_value: number;
	parent_info: parent_info;
	items: Record<node_identifier, item_type_refrence>;
}

export interface data_refrence {
	readonly index: number;
	get_current_item_refrence: () => item_type_refrence;
	get_current_item: () => item_type;
	set_current_item: (item: item_type) => void;
	update_fn: (name?: string, type?: connector_types | 'both') => void;
	get_connectors: () => Record<string, connector_refrence>;
	_get_drag_value: () => number;
	_set_drag_value: (v: number) => void;
	get_svg_paths: () => Record<string, Record<string, string>>;
	get_parent_info: () => parent_info;
	get_items: () => Record<node_identifier, item_type_refrence>;
}
