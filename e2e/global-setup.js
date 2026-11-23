import { execSync } from 'child_process';
import path from 'path';

export default async function globalSetup() {
  console.log('\n[Global Setup] Resetting demo state for Year 2028...');
  try {
    const scriptPath = path.resolve(process.cwd(), 'e2e', 'reset-demo-state.php');
    execSync(`php "${scriptPath}"`, { stdio: 'inherit' });
    console.log('[Global Setup] 2028 demo state successfully cleared.\n');
  } catch (error) {
    console.error('[Global Setup Error]: Failed to reset demo state:', error);
    throw error;
  }
}
