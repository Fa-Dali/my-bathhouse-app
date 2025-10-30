// frontend/nextjs-dashboard/app/dashboard/report-admin/calculator/fontLoader.worker.ts
self.onmessage = async ({ data }) => {
  const { path } = data;
  const fs = require('fs');
  const fontBuffer = fs.readFileSync(path);
  self.postMessage(new Uint8Array(fontBuffer).buffer);
};

// fontLoader.worker.ts содержание
const fontLoaderWorker = `
  self.onmessage = async ({ data }) => {
    const { path } = data;
    const fs = require('fs');
    const fontBuffer = fs.readFileSync(path);
    self.postMessage(new Uint8Array(fontBuffer).buffer);
  };
`;

// fontLoader.worker.ts
self.onmessage = async ({ data }) => {
  const { path } = data;
  const fs = require('fs');
  // @ts-ignore
  const fontBuffer = fs.readFileSync(path);
  self.postMessage(new Uint8Array(fontBuffer).buffer);
};
