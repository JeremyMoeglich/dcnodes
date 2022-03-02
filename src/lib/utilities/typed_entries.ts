export function typed_keys<K extends PropertyKey>(obj: Record<K, unknown>): Array<K> {
	return Object.keys(obj) as Array<K>;
}

export function typed_entries<K extends PropertyKey, V>(obj: Partial<Record<K, V>>): Array<[K, V]> {
	return Object.entries(obj) as Array<[K, V]>;
}

export function typed_from_entries<K extends PropertyKey, V>(values: [K, V][]): Record<K, V> {
	return Object.fromEntries(values) as Record<K, V>;
}
