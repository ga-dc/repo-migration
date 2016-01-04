var fs = require("fs");
var path = require("path");
var base = "curriculum/";
var exec = require('child_process').execSync;
var env = require("./env");

var rmr = function(dir) {
  if(fs.statSync(dir).isFile())
    return fs.unlink(dir)
  var list = fs.readdirSync(dir);
  for(var i = 0; i < list.length; i++) {
    var filename = path.join(dir, list[i]);
    var stat = fs.statSync(filename);
    if(filename == "." || filename == "..") {
    } else if(stat.isDirectory()) {
      rmr(filename);
    } else {
      fs.unlinkSync(filename);
    }
  }
  fs.rmdirSync(dir);
};

var everythingButDotGit = function(){
  return fs.readdirSync(base).map(function(l){
    return base + l;
  })
  .filter(function(l){
    return !/\.git/.test(l)
  })
}

var units = function(path){
  var path = path || base;
  var us = fs.readdirSync(path);
  var unit = us[0];
  return us.filter(function(u){
    return !fs.statSync(base + u).isFile() && (u[0] != ".");
  })
  .map(function(u){
    return base + u;
  })
}

var lessons = function(dir){
  return fs.readdirSync(dir).map(function(l){
    return dir + "/" + l;
  })
}

var replaceRepoWithSingleLesson = function(lesson){
  fs.readdirSync(lesson).forEach(function(f){
    fs.renameSync(lesson+"/" +f, "tmp/" + f);
  });
  everythingButDotGit().forEach(function(f){
    rmr(f);
  });
  fs.readdirSync("tmp/").forEach(function(f){
    fs.renameSync("tmp/" +f, "curriculum/" + f);
  });
  // cd curriculum
  exec("cd curriculum && git add --all && git commit -m 'migrate from monolith repo'")
  var repoName = /[^/]*$/.exec(lesson)[0];
  // create repo on github
  var opts = JSON.stringify({
    name: repoName
  })
  exec("curl -s -X POST -d '"+opts+"' https://api.github.com/orgs/super-secret/repos?access_token=" + env.token)
  // push code to github
  exec("cd curriculum && git remote rm origin && git remote add origin git@github.com:super-secret/" + repoName + " && git push origin master")
  // reset --hard SHA
}

var us = units();
us.forEach(function(u){
  console.log(u)
  var ls = lessons(u)
  ls.forEach(function(l){
    try {
    replaceRepoWithSingleLesson(l);
    } catch(e){
      console.log(e);
   }
    exec("cd curriculum && git reset --hard f6b2d5d && git clean -fd")
  })
})

