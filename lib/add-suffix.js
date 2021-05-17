const execa = require("execa");
const replace = require("replace-in-file");

const { packageJsonPath, version, name } = require("./import-package");
const getSuffixAndRegex = require("./get-suffix-and-regex");

const addSuffix = (providedSuffix) => {
  const { suffix, suffixRegex } = getSuffixAndRegex(providedSuffix);
  const buildNumber = process.env.GITHUB_RUN_NUMBER;

  const { stdout } = execa.shellSync(
    `npm view ${name} versions --registry https://npm.pkg.github.com/`
  );
  const allBetaVersions = JSON.parse(stdout.replace(/'/g, '"'))
    .filter((v) => v.includes(`${version}${suffix}`))
    .map((v) => +v.split(suffix)[1])
    .sort((a, b) => b - a);

  const latestBeta = allBetaVersions[0];
  const newBetaVersion = `${version}${suffix}${buildNumber}`;

  replace.sync({
    files: packageJsonPath,
    from: new RegExp(`\"version\": \"(\d|\.|(${suffixRegex}))+\",`, "g"),
    to: `"version": "${newBetaVersion}",`,
  });
};

module.exports = addSuffix;
