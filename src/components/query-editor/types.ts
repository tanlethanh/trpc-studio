export interface SchemaField {
  name: string;
  type: string;
  description?: string;
  required: boolean;
  defaultValue?: unknown;
  metadata?: Record<string, unknown>;
  fields?: SchemaField[];
  isAtomic: boolean;
  properties?: SchemaField[];
  items?: SchemaField;
} 