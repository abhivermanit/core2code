import ora from 'ora';
import pc from 'picocolors';
import type { Logger } from './types';

export class ConsoleLogger implements Logger {
  public info(message: string): void {
    console.log(`${pc.cyan('ℹ')} ${message}`);
  }

  public success(message: string): void {
    console.log(`${pc.green('✔')} ${message}`);
  }

  public warn(message: string): void {
    console.warn(`${pc.yellow('⚠')} ${message}`);
  }

  public error(message: string): void {
    console.error(`${pc.red('✖')} ${message}`);
  }

  public plain(message: string): void {
    console.log(message);
  }

  public async step<T>(label: string, task: () => Promise<T>): Promise<T> {
    const spinner = ora({ text: label }).start();
    try {
      const result = await task();
      spinner.succeed(label);
      return result;
    } catch (error) {
      spinner.fail(label);
      throw error;
    }
  }
}

export class SilentLogger implements Logger {
  public info(): void { /* intentionally silent */ }
  public success(): void { /* intentionally silent */ }
  public warn(): void { /* intentionally silent */ }
  public error(): void { /* intentionally silent */ }
  public plain(): void { /* intentionally silent */ }
  public async step<T>(_label: string, task: () => Promise<T>): Promise<T> {
    return task();
  }
}

export function createSilentLogger(): Logger {
  return new SilentLogger();
}
