import path from "path";
import fs from "fs";
import { execSync } from "child_process";

const githubRemoteURL = "https://github.com/NetLogo/ColorPicker.git";
const deployBranch = "build";

const distDir = path.resolve("./dist");
process.chdir(distDir);

if (fs.existsSync(".git")) {
  execSync("git remote set-url origin " + githubRemoteURL);
} else {
  execSync("git init");
  execSync(`git checkout --orphan ${deployBranch}`);
  execSync(`git remote add origin ${githubRemoteURL}`);
  execSync("git fetch origin " + deployBranch, { stdio: "ignore" });
}

execSync("git add .");
try {
  execSync(`git commit -m 'Deploy to ${deployBranch}'`);
} catch (e) {
  console.warn("Nothing to commit.");
}
execSync(`git push origin ${deployBranch} --force`);
