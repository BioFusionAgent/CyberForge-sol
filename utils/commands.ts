export interface CommandResult {
    output: string;
    error?: boolean;
    isAI?: boolean;
  }
  
  const fileSystem: { [key: string]: string | { [key: string]: string } } = {
    'home': {
      'documents': {
        'readme.txt': 'Welcome to CyberForge Terminal\nA next-generation command interface.',
      },
    },
  };
  
  let currentDirectory = '/home';
  
  export const executeCommand = (command: string): CommandResult => {
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
  
    const handlers: { [key: string]: (args: string[]) => CommandResult } = {
      help: () => ({
        output: `
  Available commands:
    cyber-agent       - Start Cyber Agent chat mode
    help              - Show this help message
    clear             - Clear the terminal
    ls                - List files and directories
    cd <dir>         - Change directory
    cat <file>       - Display file contents
    hack <target>    - Attempt to hack a target
  `.trim()
      }),
      clear: () => ({ output: '' }),
      ls: () => {
        const currentDir = getCurrentDir();
        if (typeof currentDir === 'object') {
          return { output: Object.keys(currentDir).join('\n') };
        }
        return { output: 'Unable to list directory contents', error: true };
      },
      cd: (args) => {
        if (args.length === 0) {
          currentDirectory = '/home';
          return { output: '' };
        }
        const newPath = resolvePath(args[0]);
        const newDir = getDir(newPath);
        if (newDir && typeof newDir === 'object') {
          currentDirectory = newPath;
          return { output: '' };
        }
        return { output: `cd: ${args[0]}: No such directory`, error: true };
      },
      cat: (args) => {
        if (args.length === 0) return { output: 'Usage: cat <filename>', error: true };
        const file = getCurrentDir()[args[0]];
        if (typeof file === 'string') {
          return { output: file };
        }
        return { output: `cat: ${args[0]}: No such file`, error: true };
      },
    };
  
    if (handlers[cmd]) {
      return handlers[cmd](args);
    }
  
    return {
      output: `Command not found: ${cmd}. Type 'help' for available commands.`,
      error: true
    };
  };
  
  function getCurrentDir(): { [key: string]: string | object } {
    return currentDirectory.split('/').reduce((acc: any, curr) => {
      return curr ? (acc && acc[curr]) : acc;
    }, fileSystem);
  }
  
  function resolvePath(path: string): string {
    if (path.startsWith('/')) return path;
    const current = currentDirectory.split('/').filter(Boolean);
    const parts = path.split('/');
    for (const part of parts) {
      if (part === '..') {
        current.pop();
      } else if (part !== '.') {
        current.push(part);
      }
    }
    return '/' + current.join('/');
  }
  
  function getDir(path: string): { [key: string]: string | object } | null {
    return path.split('/').filter(Boolean).reduce((acc: any, curr) => {
      return acc && acc[curr];
    }, fileSystem);
  }
  
  