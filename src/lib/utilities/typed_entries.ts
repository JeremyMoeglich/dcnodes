type object_key = string | symbol | number;

export function typed_entries<K extends object_key, V>(
    obj: Partial<Record<K, V>>
): Array<[K, V]> {
    return Object.entries(obj) as Array<[K, V]>;
}