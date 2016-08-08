var HookContainer = {
  hooks: {},
  pres: {},
  presAsync: {},
  posts: {},
  postsAsync: {}
};

var Hook = Object.create(HookContainer);

Hook.register = function(name, callback){
  this.hooks[name] = callback;
  return this;
};

Hook.pre = function(name, callback){
  if(!this.pres[name]){
    this.pres[name] = [];
  }
  var filtered = this.pres[name].filter(function(li){
    return li === callback;
  });
  if(!filtered.length){
    this.pres[name].push(callback);
  }
  return this;
};

Hook.post = function(name, callback){
  if(!this.posts[name]){
    this.posts[name] = [];
  }
  var filtered = this.posts[name].filter(function(li){
    return li === callback;
  });
  if(!filtered.length){
    this.posts[name].push(callback);
  }
  return this;
};

Hook.preAsync = function(name, callback){
  var filtered = (this.presAsync[name] || []).filter(function(li){
    return li === callback;
  });
  if(!filtered.length){
    (this.presAsync[name] = this.presAsync[name] || []).push(callback);
  }
  return this;
};

Hook.postAsync = function(name, callback){
  var filtered = (this.postsAsync[name] || []).filter(function(li){
    return li === callback;
  });
  if(!filtered.length){
    (this.postsAsync[name] = this.postsAsync[name] || []).push(callback);
  }
  return this;
};

Hook.preRemove = function(name, callback){
  if(!this.pres[name]){
    return this;
  }
  if(!callback){
    this.pres[name] = null;
    return this;
  }
  var index = this.pres[name].indexOf(callback);
  if(index > -1){
    this.pres[name].splice(index, 1);
  }
  return this;
};

Hook.postRemove = function(name, callback){
  if(!this.posts[name]){
    return this;
  }
  if(!callback){
    this.posts[name] = null;
    return this;
  }
  var index = this.posts[name].indexOf(callback);
  if(index > -1){
    this.posts[name].splice(index, 1);
  }
  return this;
};

Hook.preAsyncRemove = function(name, callback){
  if(!this.presAsync[name]){
    return this;
  }
  if(!callback){
    this.presAsync[name] = null;
    return this;
  }
  var index = this.presAsync[name].indexOf(callback);
  if(index > -1){
    this.presAsync[name].splice(index, 1);
  }
  return this;
};

Hook.postAsyncRemove = function(name, callback){
  if(!this.postsAsync[name]){
    return this;
  }
  if(!callback){
    this.postsAsync[name] = null;
    return this;
  }
  var index = this.postsAsync[name].indexOf(callback);
  if(index > -1){
    this.postsAsync[name].splice(index, 1);
  }
  return this;
};

//clear the named hook and all the callbacks
Hook.destroy = function(name){
  if(this.hooks[name]){
    this.hooks[name] = this.pres[name] = this.presAsync[name] = this.posts[name] = this.postsAsync[name] = null;
  }
  return this;
};

Hook.run = function(name){
  var self = this;
  if(!this.hooks[name]){
    throw new Error("You need to specify the named hook first");
  }

  var args = Array.prototype.slice.call(arguments);
  args.shift();

  //Async first
  return Promise
    .all((this.presAsync[name] || []).map(function(callback){
      return callback.apply(null, args);
    }))
    .then(function(data){
      return new Promise(function(resolve, reject){
        (self.pres[name] || []).map(function(callback){
          callback.apply(null, args);
        });
        self.hooks[name].apply(null, args);

        resolve();
      });
    })
    .then(function(data){
      return Promise.all((self.postsAsync[name] || []).map(function(callback){
        return callback.apply(null, args);
      }))
    })
    .then(function(data){
      return new Promise(function(resolve, reject){
        (self.posts[name] || []).map(function(callback){
          callback.apply(null, args);
        });
        resolve();
      });
    })
    .catch(function(err){
      console.log(err);
    });

};

module.exports = Hook;