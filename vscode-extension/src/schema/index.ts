import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ColumnSchemaEnhancer } from './ColumnSchemaEnhancer';

const columnSchema = JSON.parse(readFileSync(join(__dirname, '../../schemas/column-formatting.schema.json')).toString());
const schemaEnhancer = new ColumnSchemaEnhancer(columnSchema);
const newColumnSchema = schemaEnhancer.extend();

writeFileSync(join(__dirname, '../../schemas/column-formatting.extended.schema.json'), JSON.stringify(newColumnSchema, null, 2));
