import { Tool } from "ollama";

export const FUNCTIONS: Tool[] = [
  {
    type: "function",
    function: {
      name: "listFiles",
      description: "Lists files in a specified directory.",
      parameters: {
        type: "object",
        required: ["dirPath"],
        properties: {
          dirPath: {
            type: "string",
            description: "The path of the directory to list files from.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "readFile",
      description: "Reads the content of a file.",
      parameters: {
        type: "object",
        required: ["filePath"],
        properties: {
          filePath: {
            type: "string",
            description: "The path to the file to be read.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "writeFile",
      description: "Writes content to a file.",
      parameters: {
        type: "object",
        required: ["filePath", "content"],
        properties: {
          filePath: {
            type: "string",
            description: "The path to the file to be written.",
          },
          content: {
            type: "string",
            description: "The content to write to the file.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "moveFile",
      description: "Moves a file to a new location.",
      parameters: {
        type: "object",
        required: ["sourcePath", "destinationPath"],
        properties: {
          sourcePath: {
            type: "string",
            description: "The current path of the file.",
          },
          destinationPath: {
            type: "string",
            description: "The new location for the file.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "copyFile",
      description: "Copies a file to a new location.",
      parameters: {
        type: "object",
        required: ["sourcePath", "destinationPath"],
        properties: {
          sourcePath: {
            type: "string",
            description: "The source file path.",
          },
          destinationPath: {
            type: "string",
            description: "The destination file path.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "deleteFile",
      description: "Deletes a specified file.",
      parameters: {
        type: "object",
        required: ["filePath"],
        properties: {
          filePath: {
            type: "string",
            description: "The file path to delete.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "searchFiles",
      description: "Searches for files matching a pattern.",
      parameters: {
        type: "object",
        required: ["directory", "pattern"],
        properties: {
          directory: {
            type: "string",
            description: "The directory to search in.",
          },
          pattern: {
            type: "string",
            description: "The search pattern (e.g., filename or extension).",
          },
          recursive: {
            type: "boolean",
            description: "Whether to search recursively in subdirectories.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "createDirectory",
      description: "Creates a new directory.",
      parameters: {
        type: "object",
        required: ["dirPath"],
        properties: {
          dirPath: {
            type: "string",
            description: "The path of the directory to create.",
          },
        },
      },
    },
  },
];
