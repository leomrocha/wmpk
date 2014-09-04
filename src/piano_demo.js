var wmpk = angular.module("WMPK", []);

////////////////////////////////////////////////////////////////////////////////
// DIRECTIVES
////////////////////////////////////////////////////////////////////////////////
/**
 * AngularJS has a problem with src element in object tags
 * here is a fix found at:
 * https://github.com/angular/angular.js/issues/339#issuecomment-19384664
 */
wmpk.directive('embedSrc', function () {
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



////////////////////////////////////////////////////////////////////////////////
//MIDI PubSub router
////////////////////////////////////////////////////////////////////////////////
//TODO add the unsubscribe methods!!!! (not needed for the moment, but should be done later
wmpk.service('pubSubMIDI', [function() {
    
    //a simple register in the form: key: [list of callbacks]
    this.self = this;
    this.registerNoteOn = { };
    this.registerNoteOff = { };
    
    this.registerAnyNoteOn = [];
    this.registerAnyNoteOff = [];
    
    this.subscribeAnyNoteOn = function(scope, callback){
        //console.log("registering any note on scope with callback: ", scope,callback)    
        this.registerAnyNoteOn.push([scope, callback]);
    }
    this.subscribeAnyNoteOff = function(scope, callback){
        //console.log("registering any note off scope with callback: ", scope,callback)    
        this.registerAnyNoteOff.push([scope, callback]);
    }
    /*
     * Subscribes to note on event
     * midi_id id in midi notation: int
     * scope: the scope where the function is
     * callback: the name (string) of the function to call (no parameters passed)
     */
    this.subscribeOnNoteOn = function(midi_id, scope, callback){
        //console.log('subscribing to note on: ', midi_id, " ; ", callback );
        //register creation if does not exists
        var reg = this.registerNoteOn[midi_id];
        if (reg === null || reg === undefined || reg === 'undefined'){
            this.registerNoteOn[midi_id] = [];
        }
        //now add the callback
        this.registerNoteOn[midi_id].push([scope, callback]);
    };
    /*
     * Subscribes to note off event
     * midi_id id in midi notation: int
     * scope: the scope where the function is
     * callback: the name (string) of the function to call (no parameters passed)
     */
    this.subscribeOnNoteOff = function(midi_id, scope, callback){
        //console.log('subscribing to note off: ', midi_id, " ; ", callback );
        //register creation if does not exists
        var reg = this.registerNoteOff[midi_id];
        if (reg === null || reg === undefined || reg === 'undefined'){
            this.registerNoteOff[midi_id] = [];
        }
        //now add the callback
        this.registerNoteOff[midi_id].push([scope, callback]);
    };
    this.publishNoteOn = function(midi_id){
        //console.log('publishing note on: ',midi_id);
        var cbacks = this.registerNoteOn[midi_id];
        try{
            //call all the generic ones
            for(var j=0; j< this.registerAnyNoteOn.length; j++){
                var sc = this.registerAnyNoteOn[j];
                sc[0][sc[1]](midi_id);
            }
            //now all the specific calls only for that note
            for(var i=0; i< cbacks.length; i++)
            {
                //callback
                var cback = cbacks[i];
                cback[0][cback[1]](); //scope.function() call
                //console.log("callback called: ", cback[0][cback[1]]);
            }
        }catch(err){
            //nothing to see here ... move along
        }
        
    };
    this.publishNoteOff = function(midi_id){
        var cbacks = this.registerNoteOff[midi_id];
        try{
            //call all the generic ones
            for(var j=0; j< this.registerAnyNoteOff.length; j++){
                var sc = this.registerAnyNoteOff[j];
                try{
                    sc[0][sc[1]](midi_id);
                }catch(e){}
            }
            //now the specifics
            for(var i=0; i< cbacks.length; i++){
                try{
                    var cback = cbacks[i];
                    cback[0][cback[1]](); //scope.function() call
                //console.log("callback called: ", cback[0][cback[1]]);
                }catch(e){}
            }
        }catch(err){
            console.log("error occurred: ", err);
            //nothing to see here ... move along
        }
    };
}]);



////////////////////////////////////////////////////////////////////////////////
//service wrapper for MIDI.js
////////////////////////////////////////////////////////////////////////////////
wmpk.service('midiService', ['pubSubMIDI', function(pubSubMIDI) {
    //console.log("creating midiService");
    ////////////////////
    //TODO take this hardcoded thing away and add the possibility to change keyboard layout!
    this.self = this;
    this.notesStatus = []
    
    //nice loader circle thing
	Event.add("body", "ready", function() {
		MIDI.loader = new widgets.Loader("Loading Piano Sounds");
	});
    //init midi
    this.init = function(){
        //load midi
	    MIDI.loadPlugin({
		    soundfontUrl: "../assets/soundfonts/",
		    instrument: "acoustic_grand_piano",
		    callback: function() {
			    MIDI.loader.stop();
			    //TODO erase loader
		    }
	    });    
    };
    
    //things to be able to play
    //TODO make the calls more general, although for the moment this works
    this.playNote= function(midi_id){
        console.log("calling midi service note on: ", midi_id);
        if(! this.notesStatus[midi_id] === true){
            this.notesStatus[midi_id] = true;
            MIDI.noteOn(0, midi_id, 127, 0);
        }
    };
    
    this.stopNote= function(midi_id){
        console.log("calling midi service note off: ", midi_id);
        if(this.notesStatus[midi_id] === true){
            this.notesStatus[midi_id] = false;
            MIDI.noteOff(0, midi_id, 0);
        }
        
    };
    //
    //register services
    //console.log(pubSubMIDI);
    pubSubMIDI.subscribeAnyNoteOn(this, "playNote");
    pubSubMIDI.subscribeAnyNoteOff(this, "stopNote");
    this.init();
}]);

////////////////////////////////////////////////////////////////////////////////
// midi recording service
////////////////////////////////////////////////////////////////////////////////
wmpk.service('midiRecorderService', ['pubSubMIDI', function(pubSubMIDI) {
    this.self = this;
    this.recording = [];
    //this.state (playing/recording/etc)
    //FUTURE
    //this.saveAs = function(file_name, file_extension){};
    //
    this.startRecording = function(){
        //TODO
    };
    
    //Stop the play recording
    this.stopRecording = function(){
        //set recording flag to nothing   
    }
    
    //reset state to clean slate
    this.reset = function(){
        //TODO set clean slate
    }
    
    //received a note ON event
    this.noteOn = function(midi_id){
        //TODO
    }
    
    //received a note OFF event
    this.noteOff = function(midi_id){
        //TODO
    }
    //register services
    //console.log(pubSubMIDI);
    pubSubMIDI.subscribeAnyNoteOn(this, "noteOn");
    pubSubMIDI.subscribeAnyNoteOff(this, "noteOff");
}]);

////////////////////////////////////////////////////////////////////////////////
// Simple Player Service
////////////////////////////////////////////////////////////////////////////////
// Tempos: 
// 1 semifusa
// 2 fusa
// 4 semi corchea
// 8 corchea
// 16 negra
// 32 blanca
// 64 redonda
//


wmpk.service('simplePlayer', ['$timeout', 'pubSubMIDI', function($timeout, pubSubMIDI) {

    this.self = this;
    var self = this;
    //simple player that plays a secuence of notes in the format:
    self.sequence = [];
    //default bpm
    self.bpm = 60;
    //16 is the code for black key
    self.tempoMultiplier = (1000 * self.bpm) / (60 * 16);
    
    self.playNext = function(index){
        console.log("play next: ",index)
        idxOff = index - 1;
        //turn off previous note
        if(idxOff>=0 && idxOff < self.sequence.length){
            pubSubMIDI.publishNoteOff(self.sequence[idxOff][0]);
        }
        
        if(index < self.sequence.length){
            //play note 
            note = self.sequence[index][0];
            playTime = self.sequence[index][2] * self.tempoMultiplier;
            //play next note
            pubSubMIDI.publishNoteOn(note);
            //TODO wait play time
            //note OFF will be called on the callback
            $timeout(function(){
                    //console.log("calling timeout callback: ", $scope);
                    console.log(this)
                    self.playNext(index+1);
                    }, 
                    playTime
                    );
        }else{
            console.log("play sequence finished");
            //finished playing
            //callback to the caller!
            self.callback();
            //$scope.fini        
        }
    };
    
    self.setbpm = function(bpm){
        self.bpm = bpm;
        self.tempoMultiplier = (1000 * self.bpm) / (60 * 16);
    };
    
    self.play = function(sequence, callbackScope, callbackFunctionName){
        console.log("playing: ",sequence);
    //self.play = function(sequence){
        //set sequence
        self.sequence = sequence;
        //set callback
        self.callback = callbackScope[callbackFunctionName];
        self.playNext(0);
    };
    
}]);


////////////////////////////////////////////////////////////////////////////////
//Keyboard mapper sevices
////////////////////////////////////////////////////////////////////////////////
wmpk.service('keyboardService', ['pubSubMIDI', function(pubSubMIDI) {
    ////////////////////
    //TODO take this hardcoded thing away and add the possibility to change keyboard layout!
    this.self = this;
    //var layout = LeosPiano.KeyboardMappings.fr['A'];
    //var keys_ids = _.range(45, 72);
    layout_FR = LeosPiano.SimpleUniversal['FR'];
    layout_EN = LeosPiano.SimpleUniversal['EN'];
    var keys_ids = _.range(48, 66);
    
    this.mappings = {};
    for(var i=0; i < keys_ids.length; i++){
        this.mappings[layout_FR[i]] = keys_ids[i];
        this.mappings[layout_EN[i]] = keys_ids[i];
        
    }
    
    //console.log('initialized kbservice with mapping: ', this.mappings);
    //END hardcoded
    ////////////////////
    
        this.setLayout= function(layout, beginNoteName, beginMidiId){
            //TODO make the mappings
            //console.log('setting layout: ',layout);
        };
        
        //return the current layout
        this.getLayout= function(){
            //TODO
        };
        
        this.keyPressed= function(event){
            //console.log('key pressed in kbservice: ',event.keyCode);
            //map keyCode to char:
            var keyChar = LeosPiano.KeyCodeMappings[event.keyCode];
            var note = this.mappings[keyChar.toLowerCase()];
            //TODO map to midi_id
            pubSubMIDI.publishNoteOn(note);
        };
        this.keyReleased= function(event){
            //console.log('key released in kbservice: ',event.keyCode);
            var keyChar = LeosPiano.KeyCodeMappings[event.keyCode];
            var note = this.mappings[keyChar.toLowerCase()];
            pubSubMIDI.publishNoteOff(note); //TODO take out the hardcoded
        };
}]);


////////////////////////////////////////////////////////////////////////////////
// MIDI interface capture
////////////////////////////////////////////////////////////////////////////////
  

////////////////////////////////////////////////////////////////////////////////
// CONTROLLERS
////////////////////////////////////////////////////////////////////////////////

wmpk.controller('mainController', ['$scope', '$window', 'keyboardService', 'midiService', function($scope, $window, kbService, midiService) {
    
    //midiService.init();
    angular.element($window).on('keydown', function(e) {
        console.log("Key down: ", e.keyCode);
        //TODO call the keyboard processor
        //console.log('kbservice = ', kbService);
        kbService.keyPressed(e);
    });
    angular.element($window).on('keyup', function(e) {
        //console.log("Key up: ", e);
        //TODO call the keyboard processor
        kbService.keyReleased(e);
    });
    
  }]);
  
  
wmpk.controller('keyController', ['$scope', 'pubSubMIDI', function($scope, pubSubMidi) {
    //console.log('initializing controller: piano key');
    //$scope.lang = window.navigator.userLanguage || window.navigator.language;
    //the current key state
    $scope.pressed = false;
    //$scope.hideKey = ;
    $scope.hideKeyName = false;
    $scope.hideKeyLabel = false;
    //functions
    //on key pressed - mouse click
    $scope.keyPressed = function(){
        //console.log('key pressed: ', $scope.key.midi_id);
        var prevState = $scope.pressed;
        $scope.pressed = true;
        //needed in case the update function is called from PubSub callback
        if(!$scope.$$phase) {
            $scope.$apply();
        }
        //avoid infinite call loop
        else{
            //avoid sending duplicate signal
            if(!prevState){ 
                pubSubMidi.publishNoteOn($scope.key.midi_id);
            }
        }

    };
    
    //on key released
    $scope.keyReleased = function(){
    
        //console.log('key released: ', $scope.key.midi_id);
        var prevState = $scope.pressed;
        $scope.pressed = false;
        //needed in case the update function is called from PubSub callback
        if(!$scope.$$phase) {
            $scope.$apply();
        }
        //avoid infinite call loop
        else{
            //avoid sending duplicate signal
            if(prevState){ 
                pubSubMidi.publishNoteOff($scope.key.midi_id);
            }
        }

    };
    /////////////////////////////////////////////////////////////    
    //Register callbacks:
    pubSubMidi.subscribeOnNoteOn($scope.key.midi_id, $scope, "keyPressed");
    pubSubMidi.subscribeOnNoteOff($scope.key.midi_id, $scope, "keyReleased");
    /////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////
  }]);

//TODO make this more generic instead of all hardcoded
wmpk.controller('keyboardController', ['$scope', function($scope) {
    //////////////////////////////////////
    //TODO take out this hardcoded thing and make it configurable
    //console.log("starting keyboard controller");
    //var keys_ids = _.range(48, 72); //2 octaves
    //var keys_ids = _.range(36, 72); //3 octaves
    //var keys_ids = _.range(45, 72); //2 octaves and 3 keys //leave it this way until made generic if not the keyboard layout will break
    var keys_ids = _.range(21, 97);
    $scope.keys = _.map(keys_ids, function(value, key, list){ return LeosPiano.Notes.notes[value];});
    //END todo
    
    ////////////////////////////////////////////////////////////////////////////
    //WARNING this is an ugly hack but I can't see how to do it elsewhere
    //TODO do it in an init function
    //     do also a cleanup function to be able to take everything away when changing the size of the keyboard
    ipos = {top: 0, left: 0};
    var xpos = 0;
    var syn = MusicTheory.Synesthesia.data["Steve Zieverink (2004)"];
    
    for(var i=0; i<$scope.keys.length; i++){
        var key = $scope.keys[i];
        //ugly neyboard mapping:
        //key.label = $scope.layout_FR[i];
        //key.label2 = $scope.layout_EN[i];
        //ugly synesthesia setup
        var hsl_val = syn[key.number];
        //convert to RGB
        var hsl = {H: hsl_val[0], S: hsl_val[1], L:hsl_val[2]};
        //this transformation is because I've fixed the synesthesic theme already
        //TODO make it more general to be able to change the synesthesic theme
        var rgb = Color.Space.HSL_RGB(hsl);
        rgb = {R:Math.floor(rgb.R), G:Math.floor(rgb.G), B:Math.floor(rgb.B)};
        //console.log("convertion: ", hsl, " to rgb : ", rgb);
        key.synesthesia = rgb;
        //ugly to decide position
        if(key.key_color == LeosPiano.Notes.WHITE){
            
            ipos = {top: 0, left: xpos};
            key.position = ipos;
            xpos = xpos + 40;
        }else{
            //NOTE should NEVER start with a black key, or this will break
            ipos = {top: 0, left: xpos -20};
            key.position = ipos;
        }
     //console.log("keys = ", $scope.keys);
    }
    //END ugly hack
    ////////////////////////////////////////////////////////////////////////////
  }]);

  
////////////////////////////////////////////////////////////////////////////
  
wmpk.directive('keyboard', ['$compile', function($compile) {
    return {
      //link: link,
      //replace: true,
      templateUrl: "templates/keyboard.html"
    };
  }]);
  
wmpk.directive('key', ['$compile', function($compile) {
    //console.log("starting key");
    function link(scope, element, attrs) {
        
        //console.log("element ", element);
        //console.log("attrs = ", attrs);
        //console.log(scope.key);
        width = scope.key.key_color == LeosPiano.Notes.WHITE ? 40 : 30; //TODO change here the dimensions dynamically
        height = scope.key.key_color == LeosPiano.Notes.WHITE ? 200 : 120; //TODO change here the dimensions dynamically
        element.width(width);
        element.height(height);
        var offset = element.parent().offset();
        
        //console.log(scope.key.position)
        //setup position to make it look like a piano
        element.css("position", "absolute")
               .css("top", scope.key.position.top + offset.top)
               .css("left", scope.key.position.left + offset.left)
               ;
        //on mouse over -> shade
    }

    return {
        
        link: link,
        restrict: 'AE',
        templateUrl: "templates/key.html"
    };
  }]);

