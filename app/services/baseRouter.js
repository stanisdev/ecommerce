/**
 * Find and get attributes of build function
 */
function parseBuildFunction(pointer) {
   let data = pointer.build.toString();
   try {
      data = /build\s*\([^\)]+\)/ig.exec(data);
      data = data[0];
      data = /\([^\)]+\)/ig.exec(data);
      data = data[0].slice(1, -1);
      return data.split(/,\s*/);
   } catch (err) {
      throw new Error("Build function cannot be parsed: " + err);
   }
}

/**
 * Base class router
 */
class BaseRouter {

   /**
    * Prepare basic data
    */
   build(app, express, mongoose, wrap, config, passport, rootRoute) {
      parseBuildFunction(this).forEach((argument, key) => {
         this[argument] = arguments[key];
      });
      const router = express.Router();
      this.getMethods().forEach(method => {
         let httpMethod = method.name.endsWith("Post") ? "post" : "get";
         let routerArgs = ["/" + method.url].concat(
            method.hasOwnProperty("filters") ? method.filters : []
         );
         routerArgs.push(wrap(async (req, res) => {
            if (!(this instanceof Object)) {
               return;
            }
            this.req = req;
            this.res = res;
            this.body = req.body;
            this.user = req.user;
            this[method.name].call(this);
         }));
         router[httpMethod].apply(router, routerArgs);
      });
      this.viewRootPath = this.rootRoute.substr(1);
      this.services = {};
      app.use(rootRoute, router);
   }

   /**
    * Render page
    */
   render(path, data) {
      this.res.render(this.viewRootPath + "/" +path, data);
   }

   /**
    * Redirect to the page
    */
   redirect(url, data) {
      if (data instanceof Object && data.hasOwnProperty("flash")) {
         this.req.flash(data.flash.type, data.flash.message);
      }
      this.res.redirect(this.rootRoute + url);
   }

   /**
    * Get model
    */
   model(name) {
      return this.mongoose.model(name);
   }
}

module.exports = BaseRouter;
