export default interface DirectoryItem {
  name: string;
  type: 'FILE' | 'DIRECTORY';
  fullPath: string;
  mimeType: string | null;
}
