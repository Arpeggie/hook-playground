var assert = require("assert");
var myHook = require("../hook.js");

describe("hook features", function(){
  var hook = Object.create(myHook);

  function save(option){
    this.value = option;
  }

  it("should run without pres and posts when not present", function(done){
    hook.register("save", save.bind(hook));
    hook.run("save", 1)
      .then(function(){
        assert.equal(hook.value, 1);
        Promise.resolve();
        done();
      });
  });

  it("should run with pres-async when present", function(done){
    hook.register("save", save.bind(hook))
        .preAsync("save", function(option){
          this.valuePreAsync = option;
        }.bind(hook));
    hook.run("save", 2)
      .then(function(){
        assert.equal(hook.valuePreAsync, 2);
        assert.equal(hook.value, 2);
        done();
      });
  });

  it("should run with pres when present", function(done){
    hook.register("save", save.bind(hook))
        .pre("save", function(option){
          this.valuePre = option;
        }.bind(hook));
    hook.run("save", 3)
        .then(function(){
          assert.equal(hook.valuePre, 3);
          assert.equal(hook.value, 3);
          done();
        });
  });

  it("should run with posts-async when present", function(done){
    hook.register("save", save.bind(hook))
        .postAsync("save", function(option){
          this.valuePostAsync = option;
        }.bind(hook));
    hook.run("save", 4)
        .then(function(){
          assert.equal(hook.valuePostAsync, 4);
          assert.equal(hook.value, 4);
          done();
        });
  });

  it("should run with posts when present", function(done){
    hook.register("save", save.bind(hook))
        .post("save", function(option){
          this.valuePost = option;
        }.bind(hook));
    hook.run("save", 5)
        .then(function(){
          assert.equal(hook.valuePost, 5);
          assert.equal(hook.value, 5);
          done();
        });
  });

  it("should run pres after pres-async", function(done){
    hook.register("save", save.bind(hook))
        .pre("save", function(){
          this.valueOverride = "pre";
        }.bind(hook))
        .preAsync("save", function(){
          this.valueOverride = "preAsync";
        }.bind(hook));
    hook.run("save")
        .then(function(){
          assert.equal(hook.valueOverride, "pre");
          done();
        });
  });

  it("should run hook after pres", function(done){
    hook.register("save", function(){
          this.valueOverride = "hook"
        }.bind(hook))
        .pre("save", function(){
          this.valueOverride = "pre";
        }.bind(hook));
    hook.run("save")
        .then(function(){
          assert.equal(hook.valueOverride, "hook");
          done();
        });
  });

  it("should run posts-async after hook", function(done){
    hook.register("save", function(){
          this.valueOverride = "hook"
        }.bind(hook))
        .postAsync("save", function(){
          this.valueOverride = "postAsync";
        }.bind(hook));
    hook.run("save")
        .then(function(){
          assert.equal(hook.valueOverride, "postAsync");
          done();
        });
  });

  it("should run posts after posts-async", function(done){
    hook.register("save", function(){
          this.valueOverride = "hook"
        }.bind(hook))
        .post("save", function(){
          this.valueOverride = "post";
        }.bind(hook))
        .postAsync("save", function(){
          this.valueOverride = "postAsync";
        }.bind(hook));
    hook.run("save")
        .then(function(){
          assert.equal(hook.valueOverride, "post");
          done();
        });
  });

  it("should not run a hook if a pres-async fails", function(done){
    hook.register("saveAsyncFail", function(){
          this.valueOverride = "hook"
        }.bind(hook))
        .preAsync("saveAsyncFail", function(){
          return new Promise(function(resolve, reject){
            this.valueOverride = "preAsync";
            reject("stop");
          }.bind(hook));
        });
    hook.run("saveAsyncFail")
        .then(function(){
          assert.equal(hook.valueOverride, "preAsync");
          done();
        })
  });

  it("should not run a hook if a pre fails", function(done){
    hook.register("saveSyncFail", function(){
          this.valueOverride = "hook"
        }.bind(hook))
        .pre("saveSyncFail", function(){
          this.valueOverride = "pre";
          throw new Error("stop")
        }.bind(hook));
    hook.run("saveSyncFail")
        .then(function(){
          assert.equal(hook.valueOverride, "pre");
          done();
        })
  });

  it("should be able to run multiple pres-async", function(done){
    hook.register("save", save.bind(hook))
      .preAsync("save", function(){
        return new Promise(function(resolve, reject){
          this.valuePreAsync1 = 1;
          resolve();
        }.bind(hook));
      })
      .preAsync("save", function(){
        return new Promise(function(resolve, reject){
          this.valuePreAsync2 = 2;
          resolve();
        }.bind(hook));
      });
    hook.run("save")
      .then(function(){
        assert.equal(hook.valuePreAsync1, 1);
        assert.equal(hook.valuePreAsync2, 2);
        done();
      })
  });

  it("should be able to run multiple pres", function(done){
    hook.register("save", save.bind(hook))
        .pre("save", function(){
          this.valuePre1 = 1;
        }.bind(hook))
        .pre("save", function (){
          this.valuePre2 = 2;
        }.bind(hook));
    hook.run("save")
        .then(function(){
          assert.equal(hook.valuePre1, 1);
          assert.equal(hook.valuePre2, 2);
          done();
        });
  });

  it("should be able to run multiple posts-async", function(done){
    hook.register("save", save.bind(hook))
        .postAsync("save", function(){
          return new Promise(function(resolve, reject){
            this.valuePostAsync1 = 1;
            resolve();
          }.bind(hook));
        })
        .postAsync("save", function(){
          return new Promise(function(resolve, reject){
            this.valuePostAsync2 = 2;
            resolve();
          }.bind(hook));
        });
    hook.run("save")
        .then(function(){
          assert.equal(hook.valuePostAsync1, 1);
          assert.equal(hook.valuePostAsync2, 2);
          done();
        })
  });

  it("should be able to run multiple posts", function(done){
    hook.register("save", save.bind(hook))
        .post("save", function(){
          this.valuePost1 = 1;
        }.bind(hook))
        .post("save", function (){
          this.valuePost2 = 2;
        }.bind(hook));
    hook.run("save")
        .then(function(){
          assert.equal(hook.valuePost1, 1);
          assert.equal(hook.valuePost2, 2);
          done();
        });
  });

  it("should be able to remove a particular pres-async", function(done){
    hook.register("save", save.bind(hook))
        .preAsync("save", function(){
          this.valuePreAsyncRemoved = 1;
        }.bind(hook))
        .preAsyncRemove("save", function(){
          this.valuePreAsyncRemoved = 0;
        }.bind(hook));
    hook.run("save")
        .then(function(){
          assert.ok(!this.valuePreAsyncRemoved);
          done();
        });
  });

  it("should be able to remove all pres-async associated with a named hook", function(done){
    hook.register("save", save.bind(hook))
        .preAsync("save", function(){
          this.valuePreAsyncAllRemoved1 = 1;
        }.bind(hook))
        .preAsync("save", function(){
          this.valuePreAsyncAllRemoved2 = 2;
        }.bind(hook))
        .preAsyncRemove("save");
    hook.run("save")
        .then(function(){
          assert.ok(!this.valuePreAsyncAllRemoved1);
          assert.ok(!this.valuePreAsyncAllRemoved2);
          done();
        });
  });

  it("should be able to remove a particular pres", function(done){
    hook.register("save", save.bind(hook))
        .pre("save", function(){
          this.valuePreSyncAllRemoved = 1;
        }.bind(hook))
        .preRemove("save", function(){
          this.valuePreSyncAllRemoved = 1;
        }.bind(hook));
    hook.run("save")
        .then(function(){
          assert.ok(!this.valuePreSyncAllRemoved);
          done();
        });
  });

  it("should be able to remove all pres associated with a named hook", function(done){
    hook.register("save", save.bind(hook))
        .pre("save", function(){
          this.valuePreSyncAllRemoved1 = 1;
        }.bind(hook))
        .pre("save", function(){
          this.valuePreSyncAllRemoved2 = 2;
        }.bind(hook))
        .preRemove("save");
    hook.run("save")
        .then(function(){
          assert.ok(!this.valuePreSyncAllRemoved1);
          assert.ok(!this.valuePreSyncAllRemoved2);
          done();
        });
  });

  it("should be able to remove a particular posts-async", function(done){
    hook.register("save", save.bind(hook))
        .postAsync("save", function(){
          this.valuePostAsyncRemoved = 1;
        }.bind(hook))
        .postAsyncRemove("save", function(){
          this.valuePostAsyncRemoved = 0;
        }.bind(hook));
    hook.run("save")
        .then(function(){
          assert.ok(!this.valuePostAsyncRemoved);
          done();
        });
  });

  it("should be able to remove all posts-async associated with a named hook", function(done){
    hook.register("save", save.bind(hook))
        .postAsync("save", function(){
          this.valuePostAsyncAllRemoved1 = 1;
        }.bind(hook))
        .postAsync("save", function(){
          this.valuePostAsyncAllRemoved2 = 2;
        }.bind(hook))
        .postAsyncRemove("save");
    hook.run("save")
        .then(function(){
          assert.ok(!this.valuePostAsyncAllRemoved1);
          assert.ok(!this.valuePostAsyncAllRemoved2);
          done();
        });
  });

  it("should be able to remove a particular posts", function(done){
    hook.register("save", save.bind(hook))
        .post("save", function(){
          this.valuePostRemoved = 1;
        }.bind(hook))
        .postRemove("save", function(){
          this.valuePostRemoved = 0;
        }.bind(hook));
    hook.run("save")
        .then(function(){
          assert.ok(!this.valuePostRemoved);
          done();
        });
  });

  it("should be able to remove all posts associated with a named hook", function(done){
    hook.register("save", save.bind(hook))
        .post("save", function(){
          this.valuePostSyncAllRemoved1 = 1;
        }.bind(hook))
        .post("save", function(){
          this.valuePostSyncAllRemoved2 = 2;
        }.bind(hook))
        .postRemove("save");
    hook.run("save")
        .then(function(){
          assert.ok(!this.valuePostSyncAllRemoved1);
          assert.ok(!this.valuePostSyncAllRemoved2);
          done();
        });
  });

  it("should be able to remove all callbacks of a named hook", function(done){
    hook.register("saveClear", save.bind(hook))
        .pre("saveClear", function(){
          this.pre = 1;
        }.bind(hook))
        .post("saveClear", function(){
          this.post = 1;
        }.bind(hook))
        .preAsync("saveClear", function(){
          this.preAsync = 1;
        }.bind(hook))
        .postAsync("saveClear", function(){
          this.postAsync = 1;
        }.bind(hook))
        .destroy("saveClear");
    hook.register("saveClear", save.bind(hook));
    hook.run("saveClear")
        .then(function(){
          assert.ok(!this.pre);
          assert.ok(!this.post);
          assert.ok(!this.preAsync);
          assert.ok(!this.postAsync);
          done();
        });
  });
});