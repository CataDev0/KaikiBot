export interface Scripts {
  start: string;
  build: string;
  version: string;
  watch: string;
}

export interface Repository {
  type: string;
  url: string;
}

export interface Engines {
  node: string;
  npm: string;
}

export default interface IPackageJSON {
  name: string;
  version: string;
  main: string;
  scripts: Scripts;
  keywords: string[];
  author: string;
  license: string;
  description: string;
  repository: Repository;
  engines: Engines;
}

