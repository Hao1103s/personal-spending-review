const path = require("node:path");

const localElectronDist = path.join(process.cwd(), "node_modules", "electron", "dist");

module.exports = {
  appId: "com.qiuwenhao.personal-spending-review",
  productName: "Personal Spending Review",
  directories: {
    output: "release",
  },
  electronDist: ({ platformName }) => {
    if (platformName === process.platform) {
      return localElectronDist;
    }

    return undefined;
  },
  files: ["package.json", "desktop/**/*.cjs"],
  asar: true,
  extraResources: [
    {
      from: "desktop-runtime",
      to: "app-runtime",
      filter: ["**/*"],
    },
  ],
  artifactName: "personal-spending-review-${version}-${os}-${arch}.${ext}",
  mac: {
    category: "public.app-category.finance",
    target: ["dmg"],
  },
  win: {
    target: ["nsis"],
  },
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
  },
};
