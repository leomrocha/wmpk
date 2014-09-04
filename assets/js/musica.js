var mainApp = angular.module("MusicProject", ["ngRoute"]);

////////////////////////////////////////////////////////////////////////////////
// DIRECTIVES
////////////////////////////////////////////////////////////////////////////////
/**
 * AngularJS has a problem with src element in object tags
 * here is a fix found at:
 * https://github.com/angular/angular.js/issues/339#issuecomment-19384664
 */
mainApp.directive('embedSrc', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var current = element;
      scope.$watch(function() { return attrs.embedSrc; }, function () {
        var clone = element
                      .clone()
                      .attr('src', attrs.embedSrc);
        current.replaceWith(clone);
        current = clone;
      });
    }
  };
});

mainApp.directive('markdown', function (){
    //console.log("evaluating markdown");
    var converter = new Showdown.converter();
    return {
        restrict: 'AEC',
        link: function (scope, element, attrs) {
        //console.log("evaluating markdown 2");
		var htmlText = converter.makeHtml(element.text() || '');
		element.html(htmlText);
        }
    };
});


mainApp.directive('vexchord', function($compile){
    //console.log("rendering vextab");
    return{
        restrict: 'E',
        link: function(scope, element, attrs){
            //console.log("attributes = ",attrs);
            //console.log(attrs.key);
            //console.log(attrs.string);
            //console.log(attrs.shape);
             var el = createChordElement(createChordStruct(attrs.key, attrs.string, attrs.shape));
             $compile(el)(scope);
             element.replaceWith(el);
             //console.log("finish vexchord processing");
        }
    }
});

////////////////////////////////////////////////////////////////////////////////
// VIEWS
////////////////////////////////////////////////////////////////////////////////
mainApp.config(function($routeProvider, $locationProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'musica/about.html',
        })
        .when('/about',{redirectTo: '/'})
        .when('/:section', {
            templateUrl: function($routeParams){
                var path = '/musica/'+$routeParams.section+'.html';
                //console.log("generating path section = ", path);
                return path;
            },
            controller: 'pageController'
        })
        .when('/:section/:post', {
            templateUrl: 'musica/blog_post.html',
            //TODO change the following function for the previous one. Add more generic post handling
            //templateUrl: function($routeParams){
            //    //console.log("route params = ", $routeParams);
            //    var path = '/posts/'+$routeParams.section+'/'+$routeParams.post+'.html';
            //    //console.log("creating path = ", path);
            //    return path;
            //},
            controller: 'pageController'
            //controller: function($routeParams){
            //    console.log("controller = ", ctrl);
            //    var ctrl =  $routeParams.section+'Controller';
            //    return ctrl;
            //}
        });
    
    // use HTML5 history API
    //I don't want to have pretty URLs if it avoids direct linking
    //so I take this out
    //$locationProvider.html5Mode(true);
    
});

////////////////////////////////////////////////////////////////////////////////
// CONTROLLERS
////////////////////////////////////////////////////////////////////////////////

mainApp.controller('vextabController', ['$scope', function($scope) {
    $scope.vextabText;
    
  }]);
  
mainApp.directive('vextabPaper', ['$compile', function($compile) {

    var canvas = document.createElement('canvas');
    renderer = new Vex.Flow.Renderer( canvas,
                  //Vex.Flow.Renderer.Backends.RAPHAEL); //TODO support raphael
                  Vex.Flow.Renderer.Backends.CANVAS);
    artist = new Vex.Flow.Artist(10, 10, 800, {scale: 1});

    if (Vex.Flow.Player) {
        opts = {};
        //if (options) opts.soundfont_url = options.soundfont_url;
        player = new Vex.Flow.Player(artist, opts);
    }
    vextab = new Vex.Flow.VexTab(artist);

    function link(scope, element, attrs) {
        var vextabText;
        function updateTab() {
            console.log("updating tab");
            console.log(vextabText);
            try {
                vextab.reset();
                artist.reset();

                vextab.parse(vextabText);
                artist.render(renderer);
                //console.log("artist = ", artist);
            }
            catch (e) {
                console.log("Error");
                console.log(e);
            }      
            $compile(canvas)(scope);
            element.append(canvas);
            //reposition player because something breaks on the default
            if(player !== null && player !== undefined){
                console.log("player created");
                playerCanvas = element.find(".vextab-player");
                playerCanvas.css("position", "absolute")
                            .css("z-index", 10)
                            .css("top", element.get(0).offsetTop)
                            .css("left", element.get(0).offsetLeft)
                            ;
            }
        }

        scope.$watch(attrs.vextabPaper, function(value) {
            //console.log("changing vextab text to: ", value);
            if (!(value !== null && value !== undefined)){
                value = element.text();
                element.text("");
            }
            vextabText = value;
            updateTab();
        });

    }

    return {
      link: link
    };
  }]);

//setup the vextab interface template
mainApp.directive('interactiveVextab', function($compile, $http){
    return {
        //link: link,
        templateUrl: 'templates/vextab_editor.html'
    };
});



mainApp.controller('toolsController', ['$scope', function($scope){

    //for testing here, TODO set custom domain in github for accessing this as a path
    //and of course eliminate this ugly json from the JS file
    $scope.toolsList = {
        "Tuner":{
          "title" : "Tuner",
          "subtitle" : "Real-time, web based guitar tuner",
          "description": "A tuner for my guitar, and the result of many graphic iterations and tests to make it nice enough for my eyes. The toughest work is in the work behind the algorithm to make it as accurate and as fast to take it to the current state.",
          "icon-class":"fa-music",
          "width": 320,
          "height": 480,
          "source": "https://github.com/leomrocha/soundtools/blob/master/gui-tuner/bin/simple-gui-tuner.swf?raw=true",
          "help": "https://raw.githubusercontent.com/leomrocha/soundtools/master/resources/images/Tuner_cheatsheet_en.png"
        },
        "PitchTracker":{
          "title" : "PitchTracker",
          "subtitle" : "Real-time, web based advanced pitch tracker",
          "description": "A real-time pitch tracker that gives the current note, the error respect the note, and either the frequency graph or the music sheet real-time transcription",
          "icon-class":"fa-music",
          "width": 640,
          "height": 640,
          "source": "https://github.com/leomrocha/soundtools/blob/master/PitchTracker/bin/PitchTracker.swf?raw=true",
          "help": "https://raw.githubusercontent.com/leomrocha/soundtools/master/resources/images/Voice-Visualize_cheatsheet_en.png"
        }
    };

    //set the selected tool as the first one
    $scope.selectedTool = $scope.toolsList["Tuner"];
           
    //to be able to reselect later:
    $scope.setSelectedTool =  function(tool) {
       $scope.selectedTool = tool;
    };
    
    
}]);
