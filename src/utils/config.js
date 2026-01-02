import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ConfigManager {
  constructor() {
    this.configDir = path.join(__dirname, '../../config');
    this.defaultConfigPath = path.join(this.configDir, 'default.json');
    this.customConfigPath = path.join(this.configDir, 'custom.json');
    this.config = this.loadConfig();
  }

  loadConfig() {
    let config = {};

    // Load default config
    if (fs.existsSync(this.defaultConfigPath)) {
      const defaultConfig = JSON.parse(fs.readFileSync(this.defaultConfigPath, 'utf8'));
      config = { ...defaultConfig };
    }

    // Load custom config and merge
    if (fs.existsSync(this.customConfigPath)) {
      const customConfig = JSON.parse(fs.readFileSync(this.customConfigPath, 'utf8'));
      config = this.deepMerge(config, customConfig);
    }

    return config;
  }

  deepMerge(target, source) {
    const output = { ...target };
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }

  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  get(key) {
    return key.split('.').reduce((obj, k) => obj?.[k], this.config);
  }

  set(key, value) {
    const keys = key.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, k) => {
      if (!obj[k]) obj[k] = {};
      return obj[k];
    }, this.config);
    target[lastKey] = value;
    this.saveCustomConfig();
  }

  saveCustomConfig() {
    fs.mkdirSync(this.configDir, { recursive: true });
    fs.writeFileSync(
      this.customConfigPath,
      JSON.stringify(this.config, null, 2),
      'utf8'
    );
  }

  getAll() {
    return { ...this.config };
  }

  reset() {
    if (fs.existsSync(this.customConfigPath)) {
      fs.unlinkSync(this.customConfigPath);
    }
    this.config = this.loadConfig();
  }
}

export default new ConfigManager();
