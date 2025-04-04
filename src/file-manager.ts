import * as fs from "fs";
import * as path from "path";
import { logger } from "./logger";

export interface FunctionCall {
  name: string;
  arguments: Record<string, any>;
}

export class FileManager {
  async listFiles(dirPath: string): Promise<string[]> {
    try {
      logger.logInfo(`Listing files in: ${dirPath}`);

      const files = await fs.promises.readdir(dirPath);
      const fileStats = await Promise.all(
        files.map(async (file) => {
          const fullPath = path.join(dirPath, file);
          const stats = await fs.promises.stat(fullPath);
          return {
            name: file,
            isDirectory: stats.isDirectory(),
            size: stats.size,
            modifiedTime: stats.mtime,
          };
        })
      );

      const result = fileStats.map(
        (file) =>
          `${file.isDirectory ? "[DIR]" : "[FILE]"} ${file.name} (${
            file.size
          } bytes, modified: ${file.modifiedTime})`
      );

      logger.logInfo(`Files found: ${JSON.stringify(result, null, 2)}`);
      return result;
    } catch (error) {
      logger.logError(`Error listing files in ${dirPath}`, error as Error);
      throw error;
    }
  }

  async readFile(filePath: string): Promise<string> {
    try {
      logger.logInfo(`Reading file: ${filePath}`);
      const content = await fs.promises.readFile(filePath, "utf-8");
      logger.logInfo(`Read file successfully: ${filePath}`);
      return content;
    } catch (error) {
      logger.logError(`Error reading file: ${filePath}`, error as Error);
      throw error;
    }
  }

  async writeFile(filePath: string, content: string): Promise<string> {
    try {
      logger.logInfo(`Writing to file: ${filePath}`);
      await fs.promises.writeFile(filePath, content, "utf-8");
      logger.logInfo(`File written successfully: ${filePath}`);
      return `File successfully written to ${filePath}`;
    } catch (error) {
      logger.logError(`Error writing file: ${filePath}`, error as Error);
      throw error;
    }
  }

  async moveFile(sourcePath: string, destinationPath: string): Promise<string> {
    try {
      logger.logInfo(`Moving file from ${sourcePath} to ${destinationPath}`);
      await fs.promises.rename(sourcePath, destinationPath);
      logger.logInfo(
        `File moved successfully: ${sourcePath} -> ${destinationPath}`
      );
      return `File successfully moved from ${sourcePath} to ${destinationPath}`;
    } catch (error) {
      logger.logError(`Error moving file: ${sourcePath}`, error as Error);
      throw error;
    }
  }

  async copyFile(sourcePath: string, destinationPath: string): Promise<string> {
    try {
      logger.logInfo(`Copying file from ${sourcePath} to ${destinationPath}`);
      await fs.promises.copyFile(sourcePath, destinationPath);
      logger.logInfo(
        `File copied successfully: ${sourcePath} -> ${destinationPath}`
      );
      return `File successfully copied from ${sourcePath} to ${destinationPath}`;
    } catch (error) {
      logger.logError(`Error copying file: ${sourcePath}`, error as Error);
      throw error;
    }
  }

  async deleteFile(filePath: string): Promise<string> {
    try {
      logger.logInfo(`Deleting file: ${filePath}`);
      await fs.promises.unlink(filePath);
      logger.logInfo(`File deleted successfully: ${filePath}`);
      return `File ${filePath} successfully deleted`;
    } catch (error) {
      logger.logError(`Error deleting file: ${filePath}`, error as Error);
      throw error;
    }
  }

  async searchFiles(
    directory: string,
    pattern: string,
    recursive: boolean = false
  ): Promise<string[]> {
    const results: string[] = [];

    async function search(dir: string) {
      const files = await fs.promises.readdir(dir);

      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stats = await fs.promises.stat(fullPath);

        if (file.includes(pattern)) {
          results.push(fullPath);
          logger.logInfo(`Match found: ${fullPath}`);
        }

        if (stats.isDirectory() && recursive) {
          logger.logInfo(`Entering directory: ${fullPath}`);
          await search(fullPath);
        }
      }
    }

    try {
      logger.logInfo(
        `Searching for '${pattern}' in ${directory}, recursive: ${recursive}`
      );
      await search(directory);
      logger.logInfo(
        `Search completed. Results: ${JSON.stringify(results, null, 2)}`
      );
      return results;
    } catch (error) {
      logger.logError(`Error searching files in ${directory}`, error as Error);
      throw error;
    }
  }

  async createDirectory(dirPath: string): Promise<string> {
    try {
      logger.logInfo(`Creating directory: ${dirPath}`);
      await fs.promises.mkdir(dirPath, { recursive: true });
      logger.logInfo(`Directory created successfully: ${dirPath}`);
      return `Directory ${dirPath} successfully created`;
    } catch (error) {
      logger.logError(`Error creating directory: ${dirPath}`, error as Error);
      throw error;
    }
  }
}
