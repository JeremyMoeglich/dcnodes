export interface input_types {
    string: string;
    number: number;
    other: unknown;
    option: Array<string>;
}
export type io_type<T extends keyof input_types = keyof input_types> = Record<
    string,
    { type: T; value: input_types[T] }
>;