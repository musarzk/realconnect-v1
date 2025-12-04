// utils/fileToDataUrl.ts
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Invalid file result"));
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
