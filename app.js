var fs = require("fs");
var path = require("path");
var base = "curriculum/";

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
  console.log(lesson)
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
  // git add
  // git commit
  // create repo on github
  // push code to github
  // reset --hard SHA
}

var us = units();
var lessons = lessons(us[0])
replaceRepoWithSingleLesson(lessons[0]);

