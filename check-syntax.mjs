import Typescript from 'typescript';
import fs from 'fs';

const code = fs.readFileSync('./lib/blog-automation/wix-publisher.ts', 'utf8');
const result = Typescript.transpileModule(code, {
  compilerOptions: { module: Typescript.ModuleKind.ES2020 }
});

if (result.diagnostics.length > 0) {
  result.diagnostics.forEach(d => {
    console.error(`Error: ${d.messageText}`);
  });
  process.exit(1);
} else {
  console.log('✓ Typescript compiles successfully');
}
