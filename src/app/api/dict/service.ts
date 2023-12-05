import DirectoryItem from "@/types/api-router/webui/DirectoryItem";
import fs from "fs/promises";
import path from "path";
import mime from "mime-types";

export async function listDict(dictPath: string): Promise<DirectoryItem[]> {
  const direntArr = await fs.readdir(dictPath, { withFileTypes: true });
  return Promise.all(
    direntArr.map(async (dirent) => {
      if (dirent.isDirectory()) {
        return { name: dirent.name, type: 'DIRECTORY', mimeType: null } as DirectoryItem;
      } else {
        return {
          name: dirent.name,
          fullPath: path.join(dictPath, dirent.name),
          type: 'FILE',
          mimeType: mime.lookup(dirent.name) || 'unknown',
        } as DirectoryItem;
      }
    })
  );
}
