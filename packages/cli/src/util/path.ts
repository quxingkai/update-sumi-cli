import path from 'path';
import untildify from 'untildify';

export function getAbsolutePath(partialPath: string) {
    const currentPath = process.cwd();
    if (partialPath.startsWith('/')) {
      return partialPath;
    }
    else if (partialPath.startsWith('~/')) {
      return untildify(partialPath);
    } else {
      return path.join(currentPath, partialPath);
    }
}
