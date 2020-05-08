import { engineModule } from './command/engine';

// postinstall to get latest version of engine from npm
async function postinstall() {
  const engineList = await engineModule.getInstalledEngines();
  if (!engineList.length) {
    const taggedVersion = await engineModule.getTaggedVersions();
    const latestVersion = taggedVersion['latest'];
    engineModule.add(latestVersion);
    engineModule.use(latestVersion);
  }
}

postinstall();
