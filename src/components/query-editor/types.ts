type StringOrNullish = 'string' | 'null'; // Represents zod.string().nullish() (string | null | undefined) - https://github.com/tanlethanh/trpc-studio/issues/2

export interface SchemaField {
	name: string;
	type: string | Array<StringOrNullish>;
	description?: string;
	required: boolean;
	defaultValue?: unknown;
	metadata?: Record<string, unknown>;
	fields?: SchemaField[];
	isAtomic: boolean;
	properties?: SchemaField[];
	items?: SchemaField;
}
