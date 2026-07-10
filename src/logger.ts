import ora, { Ora } from 'ora';
import pc from 'picocolors';
import { Logger } from './types';

/**
 * Console logger with ora spinner support.
 */
export class ConsoleLogger implements Logger {
  private spinner: Ora | null = null;

  info(message: string): void {
    console.log(`${pc.blue('ℹ')} ${message}`);
  }

  success(message: string): void {
    console.log(`${pc.green('✔')} ${message}`);
  }

  warn(message: string): void {
    console.log(`${pc.yellow('⚠')} ${message}`);
  }

  error(message: string): void {
    console.log(`${pc.red('✖')} ${message}`);
  }

  plain(message: string): void {
    console.log(message);
  }

  startSpinner(message: string): void {
    this.spinner = ora(message).start();
  }

  stopSpinner(success = true, message?: string): void {
    if (!this.spinner) return;
    if (success) {
      this.spinner.succeed(message);
    } else {
      this.spinner.fail(message);
    }
    this.spinner = null;
  }
}

/**
 * Silent logger that produces no output. Useful for testing and programmatic usage.
 */
export class SilentLogger implements Logger {
  info(_message: string): void {}
  success(_message: string): void {}
  warn(_message: string): void {}
  error(_message: string): void {}
  plain(_message: string): void {}
  startSpinner(_message: string): void {}
  stopSpinner(_success?: boolean, _message?: string): void {}
}

/**
 * Create a silent logger instance.
 */
export function createSilentLogger(): Logger {
  return new SilentLogger();
}
