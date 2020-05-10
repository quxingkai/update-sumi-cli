import { YmlConfiguration } from './util/yml-config';
import { kaitianInfraDir } from './const';

export interface ITeamAccount {
  teamAccount: string;
  teamKey: string;
}

export interface IConfig {
  teamAccounts: {
    [publisher: string]: ITeamAccount;
  };
  engine?: string;
}

class Config {
  private configYml: YmlConfiguration = new YmlConfiguration<IConfig>(
    kaitianInfraDir,
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
}

export const kaitianConfiguration = new Config();
