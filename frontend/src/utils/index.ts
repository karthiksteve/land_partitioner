export function formatArea(acres: number, hectares: number): string {
  return `${acres.toFixed(4)} acres (${hectares.toFixed(4)} ha)`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generatePNIUDisplay(pniu: string): string {
  if (!pniu) return "N/A";
  const parts = pniu.match(/.{1,4}/g);
  return parts ? parts.join(" ") : pniu;
}

export function validatePlotNumber(plotNumber: string): boolean {
  return /^[a-zA-Z0-9/\\-]+$/.test(plotNumber);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
