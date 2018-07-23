import path from 'path';
import compiler from './compiler.js';

test('Parse my .gitignore', async () => {
  const stats = await compiler(path.resolve('./.gitignore'));
  const output = stats.toJson().modules[0].source;

  expect(output).toBe(`export default "Hey Alice!\\n"`);
});