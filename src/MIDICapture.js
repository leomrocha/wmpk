MIDICapture = (function() {

    //var self = this;
    //this.self = this;
    
    var midi = null;  // global MIDIAccess object
    var inputs = [];
    var outputs = [];
    var input = null;
    var output = null;
    var eventCallback = null;
    var logEvents = true;
    
    onConnect = function( event ){
        console.log("device connected: ");
        //console.log(event);
    };
    
    onDisconnect = function( event ){
        console.log("device disconnected: ");
        //console.log(event);
    };
    
    onMIDISuccess = function( midiAccess ) {
        //console.log( "MIDI ready!" );
        midi = midiAccess;  // store in the global (in real usage, would probably keep in an object instance)
        //do al the other things that need to be done
        midi.ondisconnect = onDisconnect;
        midi.onconnect = onConnect;
        inputs = midi.inputs();
        outputs = midi.outputs();
        //console.log("functions setup ok");
        //setupDefault();
        selectInputDevice(0);
        selectOutputDevice(0);
        //console.log("defaults setup ok");
        //console.log(midi);
        //console.log(input);
    };

    onMIDIFailure = function(msg) {
        console.log( "Failed to get MIDI access - " + msg );
    };

    onMIDIDisconnect = function(data){
        console.log("MIDI device disconnected "+ data);
    };

    requestMIDIAccess = function(){
        navigator.requestMIDIAccess().then( onMIDISuccess, onMIDIFailure );
    };

    listInputs = function(){
        var ins = [];
        for(var i = 0; i< inputs.length; i++){
            ins.push([i, inputs[i].name]);
        }
        return ins;
    };
    
    listOutputs = function(){
        var outs = [];
        for(var i = 0; i< outputs.length; i++){
            outs.push([i, outputs[i].name]);
        }
        return outs;
    };
    
    logMIDIEvent = function( event ) {
      var str = "MIDI message received at timestamp " + event.receivedTime + " [" + event.data.length + " bytes]: ";
      for (var i=0; i<event.data.length; i++) {
        str += "0x" + event.data[i].toString(16) + " ";
      }
      console.log( str );
    };

    logRawMIDIEvent = function (event){
        console.log(event);
    };

    onMIDIMessage = function(event){
        //console.log("midi message arrived: ");
        //for each registered function, cal the function with the midi message
        //TODO make it correct and create register callback functions
        //logRawMIDIEvent(event);
        if(logEvents){
            logMIDIEvent(event);
        }
        if( eventCallback != null && eventCallback != undefined && eventCallback != 'undefined'){
            //console.log("calling callback");
            eventCallback(event);
        }else{
            //console.log("no callback activated");
        }
    };
    
    onDisconnect = function(event){
        console.log("device disconnected");
        console.log(event);
    };
    
    selectInputDevice = function(index){
        //console.log("select input device");
        if(inputs.length > index){
            input = inputs[index];
            input.onmidimessage = onMIDIMessage;
            input.ondisconnect = onDisconnect;
        }
        else{
            console.log("Selected device not available");
        }
        //console.log("setup default OK");
    };
    
    selectOutputDevice = function(index){
        //console.log("select output device");
        if(inputs.length > index){
            output = outputs[index];
            output.ondisconnect = onDisconnect;
        }
        else{
            console.log("Selected device not available");
        }
        //console.log("setup default OK");
    };
    
    setOnMIDIEventCallback = function(cback){
        //console.log("setting on midi callback");
        eventCallback = cback;
    };
    
    unsetOnMIDIEventCallback = function(cback){
        eventCallback = null;
    };
    
    noteOn = function(note, velocity){
        console.log("note On ", note, velocity);
        //TODO
    };
    
    noteOff = function(note, velocity){
        console.log("note On ", note, velocity);
        //TODO
    };
    
    init = function(){
        requestMIDIAccess();
    };
    
    getInputs = function(){
        return inputs;
    };

    getInput = function(){
        return input;
    };
    
    getOutputs = function(){
        return outputs;
    };

    getOutput = function(){
        return output;
    };
    
    setLogEvents = function(){
        logEvents = true;
    };
    unsetLogEvents = function(){
        logEvents = false;
    };
    
    return {
    
        init: init,
        selectInputDevice: selectInputDevice,
        selectOutputDevice: selectOutputDevice,
        listInputs: listInputs,
        listOutputs: listOutputs,
        //getInputs: getInputs,
        //getInput: getInput,
        //getOutputs: getOutputs,
        //getOutput: getOutput,
        setOnMIDIEventCallback: setOnMIDIEventCallback,
        unsetOnMIDIEventCallback: unsetOnMIDIEventCallback,
        noteOn: noteOn,
        noteOff: noteOff,
        setLogEvents: setLogEvents,
        unsetLogEvents: unsetLogEvents
    }
})();
