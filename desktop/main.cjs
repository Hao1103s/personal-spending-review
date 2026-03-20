const { app, BrowserWindow, dialog, shell } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const net = require("node:net");

const isDevelopment = Boolean(process.env.ELECTRON_START_URL);
let mainWindow = null;
let serverBootPromise = null;

function normalizeSqlitePath(filePath) {
  return filePath.replace(/\\/g, "/");
}

async function findAvailablePort() {
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : null;
      server.close(() => {
        if (!port) {
          reject(new Error("无法分配本地端口"));
          return;
        }
        resolve(port);
      });
    });
  });
}

async function waitForServer(url, retries = 60) {
  let lastError = null;

  for (let index = 0; index < retries; index += 1) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status >= 400) {
        return;
      }
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw lastError ?? new Error(`桌面内嵌服务未能启动: ${url}`);
}

function getBundledRuntimeDir() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "app-runtime")
    : path.join(app.getAppPath(), "desktop-runtime");
}

function getBundledDatabasePath() {
  return path.join(getBundledRuntimeDir(), "prisma", "dev.db");
}

function ensureWritableDatabase() {
  const userDataDir = app.getPath("userData");
  const dbDir = path.join(userDataDir, "prisma");
  const writableDatabasePath = path.join(dbDir, "personal-spending-review.db");

  fs.mkdirSync(dbDir, { recursive: true });

  if (!fs.existsSync(writableDatabasePath)) {
    const bundledDatabasePath = getBundledDatabasePath();
    if (!fs.existsSync(bundledDatabasePath)) {
      throw new Error(`未找到打包数据库文件: ${bundledDatabasePath}`);
    }

    fs.copyFileSync(bundledDatabasePath, writableDatabasePath);
  }

  return writableDatabasePath;
}

async function startBundledServer() {
  if (serverBootPromise) {
    return serverBootPromise;
  }

  serverBootPromise = (async () => {
    const runtimeDir = getBundledRuntimeDir();
    const serverPath = path.join(runtimeDir, "server.js");

    if (!fs.existsSync(serverPath)) {
      throw new Error(`未找到桌面运行时文件: ${serverPath}`);
    }

    const writableDatabasePath = ensureWritableDatabase();
    const port = await findAvailablePort();

    process.env.NODE_ENV = "production";
    process.env.PORT = String(port);
    process.env.HOSTNAME = "127.0.0.1";
    process.env.DATABASE_URL = `file:${normalizeSqlitePath(writableDatabasePath)}`;

    process.chdir(runtimeDir);
    require(serverPath);

    const serverUrl = `http://127.0.0.1:${port}`;
    await waitForServer(serverUrl);
    return serverUrl;
  })();

  return serverBootPromise;
}

async function createMainWindow() {
  const targetUrl = isDevelopment
    ? process.env.ELECTRON_START_URL
    : await startBundledServer();

  const window = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1100,
    minHeight: 760,
    backgroundColor: "#f6f3ef",
    title: "个人消费整理与复盘工具",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  await window.loadURL(targetUrl);

  if (isDevelopment) {
    window.webContents.openDevTools({ mode: "detach" });
  }

  mainWindow = window;
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createMainWindow();
  }
});

app.whenReady()
  .then(createMainWindow)
  .catch((error) => {
    dialog.showErrorBox(
      "桌面应用启动失败",
      error instanceof Error ? error.stack ?? error.message : String(error),
    );
    app.quit();
  });
