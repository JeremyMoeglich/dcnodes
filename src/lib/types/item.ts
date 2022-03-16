import type { SvelteComponent } from 'svelte';

export interface vector {
	x: number;
	y: number;
}

export type connector_types = 'in' | 'out';
export type connection_name = string;
export type node_identifier = number;
export type node_connections = Record<string, Set<connector_identifier<'in'> | vector>>;

export interface connector {
	position: vector;
	direction: vector;
}

export interface readonly_connector_refrence {
	get_location: () => vector;
	get_direction: () => vector;
}

export interface connector_refrence extends readonly_connector_refrence {
	set_location: (v: vector) => void;
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
}

export interface parent_info {
	position: vector;
}

export interface persistent_data<N extends node_identifier = node_identifier> {
	readonly index: N;
	item: item_type;
	svg_paths: Record<string, Record<string, string>>;
	drag_value: number;
	connectors: Record<string, connector_refrence>;
}

export interface data<N extends node_identifier = node_identifier> extends persistent_data<N> {
	parent_info: parent_info;
	items: Record<node_identifier, item_type_refrence>;
}

export type persistent_datas<N extends node_identifier = node_identifier> = Record<
	N,
	persistent_data<N>
>;

export type datas_refrence = Record<node_identifier, data_refrence>;

export interface data_refrence {
	readonly index: number;
	get_current_item_refrence: () => item_type_refrence;
	get_current_item: () => item_type;
	set_current_item: (item: item_type) => void;
	update_connections: (name?: string, type?: connector_types | 'both') => void;
	get_connectors: () => Record<string, connector_refrence>;
	_get_drag_value: () => number;
	_set_drag_value: (v: number) => void;
	get_svg_paths: () => Record<string, Record<string, string>>;
	get_parent_info: () => parent_info;
	get_items: () => Record<node_identifier, item_type_refrence>;
}
