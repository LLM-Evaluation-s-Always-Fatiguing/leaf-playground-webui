export function triggerDownload(url: string, fileName: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function downloadSceneTaskResultZip(taskId: string) {
  triggerDownload(`/api/server/task/${taskId}/results/download`, `${taskId}_result.zip`);
}
