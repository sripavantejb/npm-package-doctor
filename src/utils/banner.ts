import chalk from "chalk";
import figlet from "figlet";

export interface BannerOptions {
  disabled?: boolean;
  json?: boolean;
  silent?: boolean;
}

const fallbackBanner = String.raw`
 _   _ ____  __  __   ____   _    ____ _  __    _    ____ _____
| \ | |  _ \|  \/  | |  _ \ / \  / ___| |/ /   / \  / ___| ____|
|  \| | |_) | |\/| | | |_) / _ \| |   | ' /   / _ \| |  _|  _|
| |\  |  __/| |  | | |  __/ ___ \ |___| . \  / ___ \ |_| | |___
|_| \_|_|   |_|  |_| |_| /_/   \_\____|_|\_\/_/   \_\____|_____|
 ____   ___   ____ _____ ___  ____
|  _ \ / _ \ / ___|_   _/ _ \|  _ \
| | | | | | | |     | || | | | |_) |
| |_| | |_| | |___  | || |_| |  _ <
|____/ \___/ \____| |_| \___/|_| \_\
`;

export function shouldShowBanner(options: BannerOptions = {}): boolean {
  if (options.disabled || options.json || options.silent) {
    return false;
  }

  if (process.env.CI === "true" || process.env.CI === "1") {
    return false;
  }

  if (!process.stdout.isTTY) {
    return false;
  }

  return true;
}

export function getBannerText(): string {
  try {
    return figlet.textSync("NPM PACKAGE DOCTOR", {
      font: "Standard",
      horizontalLayout: "default",
      verticalLayout: "default"
    });
  } catch {
    return fallbackBanner;
  }
}

export function showBanner(options: BannerOptions = {}): void {
  if (!shouldShowBanner(options)) {
    return;
  }

  const title = chalk.cyanBright.bold(getBannerText());
  const creator = chalk.white("Created by Sri Pavan Tej Balam");
  const github = chalk.gray("GitHub: @sripavantejb");

  console.log(`${title}\n${creator}\n${github}\n`);
}
