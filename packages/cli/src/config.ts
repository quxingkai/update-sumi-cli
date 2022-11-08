import { YmlConfiguration } from './util/yml-config';
import { opensumiInfraDir } from './const';

export interface ITeamAccount {
  accountId: string;
  masterKey: string;
}

export interface IConfig {
  teamAccounts: {
    [publisher: string]: ITeamAccount;
  };
  engine?: string;
}

class Config {
  private configYml: YmlConfiguration = new YmlConfiguration<IConfig>(
    opensumiInfraDir,
    'config.yml',
    { teamAccounts: {} },
  );

  get content(): IConfig {
    return this.configYml.readYmlSync();
  }

  set content(data: IConfig) {
    this.configYml.writeYmlSync(data);
  }

  public async getContent(): Promise<IConfig> {
    return await this.configYml.readYml();
  }

  public async updateContent(data: Partial<IConfig>) {
    const content = await this.getContent();
    return await this.configYml.writeYml({
      ...content,
      ...data,
    });
  }

  public async replaceContent(data: IConfig) {
    return await this.configYml.writeYml(data);
  }

  public async getTeamAccount(publisher: string): Promise<ITeamAccount | undefined> {
    const content = await this.getContent();
    return content.teamAccounts && content.teamAccounts[publisher];
  }

  public async getEngineVersion(): Promise<string | undefined> {
    const content = await this.getContent();
    return content.engine;
  }
}

export const opensumiConfiguration = new Config();
