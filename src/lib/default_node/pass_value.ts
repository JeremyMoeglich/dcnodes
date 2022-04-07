export interface default_node_props<I extends string, O extends string> {
	inputs: ReadonlyArray<I>;
	outputs: ReadonlyArray<O>;
	fn: (values: Record<I, unknown>) => Record<O, unknown>;
}
