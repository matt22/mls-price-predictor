import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

// Adds .openapi() to every zod schema so models can carry spec metadata.
extendZodWithOpenApi(z);

export { z };
